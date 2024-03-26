import PullComponent from "../pull-class";
import { parseError } from "../error/error-parse";
import path from "path";
import fs from "fs";
import { z } from "zod";
import cliProgress, { SingleBar } from "cli-progress";
import * as cheerio from "cheerio";

// dirname does not exist in esm, so we need to polyfill
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type AllLabels = {
  accounts: Array<string>;
  tokens: Array<string>;
  blocks: ReadonlyArray<string>;
};
type AccountRow = {
  address: string;
  nameTag: string;
};
type TokenRow = {
  address: string;
  tokenName: string;
  tokenSymbol: string;
  website: string;
};
type AccountRows = Array<AccountRow>;
type TokenRows = Array<TokenRow>;
const bar1: SingleBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic,
);

class etherscan extends PullComponent {
  name = "etherscan";
  baseUrl = "https://etherscan.io";
  constructor(browser: any, page: any, isDebug: boolean) {
    super(browser, page, isDebug);
    this.baseUrl = z.string().url().startsWith("https://").parse(this.baseUrl);
    this.log("Etherscan created");
  }
  public async pull() {
    const rootDirectory = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "data",
      this.name,
    );
    if (!fs.existsSync(rootDirectory)) {
      fs.mkdirSync(rootDirectory);
    }

    await this.login();
    const allLabels = await this.fetchAllLabels();

    bar1.start(allLabels.tokens.length + allLabels.accounts.length, 0);

    console.log(`🐌 Pulling all of tokens started...`);
    for (const [index, url] of allLabels.tokens.entries()) {
      bar1.update(index);
      // fetch all addresses from all tables
      const tokenRows = await this.pullAllTokenRows(url);
      const labelName = z.string().parse(url.split("/").pop()?.split("?")[0]);

      if (tokenRows.length > 0) {
        const outputDirectory = path.join(rootDirectory, labelName);
        const sortedTokenRows = this.sortTokenRows(tokenRows);
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory);
        }
        fs.writeFileSync(
          path.join(outputDirectory, "tokens.json"),
          JSON.stringify(sortedTokenRows),
        );
      }
    }
    console.log(`✅ Pulling all of tokens completed!`);
    console.log(`🐌 Pulling all of accounts started...`);
    for (const [index, url] of allLabels.accounts.entries()) {
      bar1.update(allLabels.tokens.length + index);
      // fetch all addresses from all tables
      const accountRows = await this.pullAccountRows(url);
      const labelName = z.string().parse(url.split("/").pop()?.split("?")[0]);

      if (accountRows.length > 0) {
        const outputDirectory = path.join(rootDirectory, labelName);
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory);
        }
        const sortedAccountRows = this.sortAccountAdresses(accountRows);
        fs.writeFileSync(
          path.join(outputDirectory, "accounts.json"),
          // TODO: use prettier instead of "null", 2
          JSON.stringify(sortedAccountRows),
        );
      }
    }
    console.log(`✅ Pulling all of accounts completed!`);
    console.log(`✅ Pulling all of ${this.name} completed!`);
    bar1.stop();
  }
  private selectAllAnchors = (html: string): ReadonlyArray<string> => {
    const $ = cheerio.load(html);
    const parent = $("div > div > div.row.mb-3");

    let anchors: ReadonlyArray<string> = [];
    parent.find("a").each((index, element) => {
      const pathname = $(element).attr("href");
      if (typeof pathname !== "string") {
        console.log(`returning early because "${pathname}" is not a string`);
        return;
      }
      // tokens has a max page size of 100 while accounts seems to allow 10,000+
      const maxRecordsLength = pathname.includes("tokens") ? 100 : 10_000;
      const size = $(element).text();
      const regex = /\((.*?)\)/;
      const recordCount = Number(regex.exec(size)?.[1]);
      // if statement needed because otherwise we freeze forever on URL's like "beacon-depositor"
      if (recordCount < maxRecordsLength) {
        const href = `${this.baseUrl}${pathname}?size=${maxRecordsLength}`;
        anchors = [...anchors, href];
      }
    });
    return anchors;
  };

  private fetchAllLabels = async (): Promise<AllLabels> => {
    const PAGE_URL = `${this.baseUrl}/labelcloud`;

    const labelCloudHtml = await this.fetchPageHtml(
      PAGE_URL,
      `button[data-url]`,
    );

    const allAnchors = this.selectAllAnchors(labelCloudHtml);
    const allLabels: AllLabels = { accounts: [], tokens: [], blocks: [] };
    allAnchors.forEach((url) => {
      if (url.includes("/accounts/")) {
        allLabels.accounts = [...allLabels.accounts, url];
      } else if (url.includes("/tokens/")) {
        allLabels.tokens = [...allLabels.tokens, url];
      } else if (url.includes("/blocks/")) {
        allLabels.blocks = [...allLabels.blocks, url];
      } else if (url.includes("/txs/")) {
        // ignore these for now
      } else {
        throw new Error(
          `url "${url}" does not belong to "accounts", "tokens", "blocks", nor "txs"`,
        );
      }
    });
    return allLabels;
  };

  private selectAllTokenAddresses(html: string): TokenRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: TokenRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[1]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title");
      if (typeof address !== "string") {
        return;
      }
      const tokenNameColumn = $(tableCells[2]).text().trim();
      const regex = /^(.*)\n\s*\((.*)\)/;
      const match = tokenNameColumn.match(regex);
      const tokenName = match?.[1];
      const tokenSymbol = match?.[2];
      const website = $(tableCells[5]).text().trim().toLowerCase();
      const tokenRow: TokenRow = {
        address: address.trim(),
        tokenName: tokenName || "",
        tokenSymbol: tokenSymbol || "",
        website,
      };

      addressesInfo = [...addressesInfo, tokenRow];
    });

    return addressesInfo;
  }
  private selectAllAccountAddresses(
    html: string,
    subcatId: string = "0",
  ): AccountRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-${subcatId} > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: AccountRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[0]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title");
      if (typeof address !== "string") {
        return;
      }
      const newAddressInfo: AccountRow = {
        address: address.trim(),
        nameTag: $(tableCells[1]).text().trim(),
      };

      addressesInfo = [...addressesInfo, newAddressInfo];
    });

    return addressesInfo;
  }

  /**
   * Enters a username and password, but submit is not automated so that operator can submit captcha.
   */
  private async login() {
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.fill(
      "#ContentPlaceHolder1_txtUserName",
      process.env.ETHERSCAN_EMAIL || "",
    );
    await this.page.fill(
      "#ContentPlaceHolder1_txtPassword",
      process.env.ETHERSCAN_PASSWORD || "",
    );
    console.log(`🐢 Waiting for operator to complete login...`);
    // TODO: Update this deprecated function to instead use "this.page.waitForURL" (https://playwright.dev/docs/api/class-this.page#this.page-wait-for-url)
    await this.page.waitForNavigation();
    console.log(`✅ Login completed!`);
  }

  private pullAllTokenRows = async (url: string) => {
    const addressesHtml = await this.fetchPageHtml(
      url,
      `a[aria-label="Copy Address"]`,
    );
    const allAddresses = this.selectAllTokenAddresses(addressesHtml);
    return allAddresses;
  };
  private pullAccountRows = async (url: string) => {
    const addressSelector = "tr > td > span a";
    const addressesHtml = await this.fetchPageHtml(url, addressSelector);
    const $ = cheerio.load(addressesHtml);
    let allAddresses: AccountRows = [];

    const navPills = $(".nav-pills");
    // check if there are subcategories (nav-pills)
    if (navPills.length > 0) {
      const anchors = navPills.find("li > a");
      const subcatIds: Array<string> = anchors.toArray().map((anchor) => {
        const subcatId = z.string().parse($(anchor).attr("val"));
        return subcatId;
      });
      for (const subcatId of subcatIds) {
        const subcatUrl = `${url}&subcatid=${subcatId}`;
        const subcatAddressesHtml = await this.fetchPageHtml(
          subcatUrl,
          addressSelector,
        );
        const subcatAddresses = this.selectAllAccountAddresses(
          subcatAddressesHtml,
          subcatId,
        );
        allAddresses = [...allAddresses, ...subcatAddresses];
      }
    } else {
      console.log(`no navpills for ${url}`);
      allAddresses = this.selectAllAccountAddresses(addressesHtml);
      console.dir({ allAddresses });
    }
    return allAddresses;
  };

  private sortTokenRows(tokenRows: TokenRows) {
    const sortedAddresses = tokenRows.sort((a, b) => {
      const addressA = a.address.toLowerCase();
      const addressB = b.address.toLowerCase();
      if (addressA < addressB) {
        return -1;
      }
      if (addressA > addressB) {
        return 1;
      }
      return 0;
    });
    return sortedAddresses;
  }
  private sortAccountAdresses(accountAddresses: AccountRows) {
    const sortedAddresses = accountAddresses.sort((a, b) => {
      const nameTagA = a.nameTag.toLowerCase();
      const nameTagB = b.nameTag.toLowerCase();
      if (nameTagA < nameTagB) {
        return -1;
      }
      if (nameTagA > nameTagB) {
        return 1;
      }
      // If nameTags are the same, sort by address
      const addressA = a.address.toLowerCase();
      const addressB = b.address.toLowerCase();
      if (addressA < addressB) {
        return -1;
      }
      if (addressA > addressB) {
        return 1;
      }
      return 0;
    });
    return sortedAddresses;
  }
}
export default etherscan;
