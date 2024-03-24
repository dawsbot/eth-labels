import { z } from "zod";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { Page } from "playwright";
import { parseError } from "./error-parse";

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

export class AnyscanPuller {
  #baseUrl: string;
  #directoryName: string;
  /**
   * @example
   * const etherscanPuller = new AnyscanPuller({baseUrl: 'https:://etherscan.io', directoryName: 'etherscan'});
   */
  constructor({
    baseUrl,
    directoryName,
  }: {
    baseUrl: string;
    directoryName: string;
  }) {
    this.#baseUrl = z.string().url().startsWith("https://").parse(baseUrl);
    const filenameRegex = /^[a-z0-9_\-.]+$/;
    this.#directoryName = z.string().regex(filenameRegex).parse(directoryName);
  }

  private selectAllAnchors = (html: string): ReadonlyArray<string> => {
    const $ = cheerio.load(html);
    const parent = $(
      "#content > div.container-xxl.pb-12.mb-1.mt-4 > div > div > div.row.mb-3",
    );

    let anchors: ReadonlyArray<string> = [];
    parent.find("div > div > ul > li > a").each((index, element) => {
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
        const href = `${this.#baseUrl}${pathname}?size=${maxRecordsLength}`;
        anchors = [...anchors, href];
      }
    });
    return anchors;
  };

  private fetchAllLabels = async (page: Page): Promise<AllLabels> => {
    const PAGE_URL = `${this.#baseUrl}/labelcloud`;

    const labelCloudHtml = await this.fetchPageHtml(
      PAGE_URL,
      page,
      `button[data-url="0x-protocol"]`, // requires that 0x-protocol is one of the labels
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

  private async fetchPageHtml(
    url: string,
    page: Page,
    waitForSelector: string,
  ): Promise<string> {
    // Navigate to the desired URL
    await page.goto(url);
    try {
      await page.waitForSelector(waitForSelector, { timeout: 15_000 });
      await this.randomSleep();
    } catch (error) {
      parseError(error);
    }
    // Get the HTML content of the entire page
    const pageContent = await page.content();
    return pageContent;
  }

  private selectAllTokenAddresses(html: string): TokenRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: TokenRows = [];
    parent.find("tr").each((index, trElement) => {
      const tds = $(trElement).find("td");

      const anchorWithDataBsTitle = $(tds[1]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title") || "";
      const tokenNameColumn = $(tds[2]).text().trim();
      // const regex = /^(.*)\\n\s*\((\w+)\)/;
      const regex = /^(.*)\n\s*\((.*)\)/;
      const match = tokenNameColumn.match(regex);
      console.dir({ tokenNameColumn: `"${tokenNameColumn}"`, match });
      const tokenName = match?.[1];
      const tokenSymbol = match?.[2];
      const website = $(tds[5]).text().trim().toLowerCase();
      const tokenRow: TokenRow = {
        address: z.string().parse(address).trim(),
        tokenName: tokenName || "",
        tokenSymbol: tokenSymbol || "",
        website,
      };
      console.dir(tokenRow);

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
    parent.find("tr").each((index, trElement) => {
      const tds = $(trElement).find("td");

      const anchorWithDataBsTitle = $(tds[0]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title") || "";
      const newAddressInfo: AccountRow = {
        address: z.string().parse(address).trim(),
        nameTag: $(tds[1]).text().trim(),
      };

      addressesInfo = [...addressesInfo, newAddressInfo];
    });

    return addressesInfo;
  }

  /**
   * Enters a username and password, but submit is not automated so that operator can submit captcha.
   */
  private async login(page: Page) {
    await page.goto(`${this.#baseUrl}/login`);
    await page.fill(
      "#ContentPlaceHolder1_txtUserName",
      process.env.ETHERSCAN_EMAIL || "",
    );
    await page.fill(
      "#ContentPlaceHolder1_txtPassword",
      process.env.ETHERSCAN_PASSWORD || "",
    );
    await page.waitForNavigation();
  }

  private pullAllTokenAddresses = async (url: string, page: Page) => {
    const addressesHtml = await this.fetchPageHtml(
      url,
      page,
      `a[aria-label="Copy Address"]`,
    );
    const allAddresses = this.selectAllTokenAddresses(addressesHtml);
    return allAddresses;
  };
  private pullAllAccountAddresses = async (url: string, page: Page) => {
    const addressesHtml = await this.fetchPageHtml(
      url,
      page,
      `a[aria-label="Copy Address"]`,
    );
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
          page,
          `a[aria-label="Copy Address"]`,
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

  private sortAllAdresses(allAddresses: AccountRows) {
    const sortedAddresses = allAddresses.sort((a, b) => {
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
  private async randomSleep() {
    const randomDelay = Math.random() * 600;
    await sleep(randomDelay + 500);
  }

  public async pullAndWriteAllAddresses(page: Page) {
    const rootDirectory = path.join(
      __dirname,
      "..",
      "data",
      this.#directoryName,
    );
    if (!fs.existsSync(rootDirectory)) {
      fs.mkdirSync(rootDirectory);
    }

    await this.login(page);
    const allLabels = await this.fetchAllLabels(page);

    /*
    for (const url of allLabels.tokens.reverse()) {
      // delay between 0.5 and 1 seconds for processing
      await sleep(randomDelay);

      // fetch all addresses from all tables
      const allAddresses = await this.pullAllTokenAddresses(url, page);
      const labelName = z.string().parse(url.split("/").pop()?.split("?")[0]);

      if (allAddresses.length > 0) {
        const outputDirectory = path.join(rootDirectory, labelName);
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory);
        }
        fs.writeFileSync(
          path.join(outputDirectory, "tokens.json"),
          JSON.stringify(allAddresses)
        );
      }
      // console.dir({
      //   url,
      //   allAddresses,
      //   length: allAddresses.length,
      // });
    }
    */
    for (const url of allLabels.accounts.reverse()) {
      // delay between 0.5 and 1 seconds for processing

      // fetch all addresses from all tables
      const allAddresses = await this.pullAllAccountAddresses(url, page);
      const labelName = z.string().parse(url.split("/").pop()?.split("?")[0]);

      console.dir({ allAddresses, labelName });
      if (allAddresses.length > 0) {
        const outputDirectory = path.join(rootDirectory, labelName);
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory);
        }
        const sortedAddresses = this.sortAllAdresses(allAddresses);
        fs.writeFileSync(
          path.join(outputDirectory, "accounts.json"),
          // TODO: use prettier instead of "null", 2
          JSON.stringify(sortedAddresses),
        );
      }
      // console.dir({
      //   url,
      //   allAddresses,
      //   length: allAddresses.length,
      // });
    }
  }
}
