import * as cheerio from "cheerio";
import type { SingleBar } from "cli-progress";
import cliProgress from "cli-progress";
import fs from "fs";
import path from "path";
import type { Page } from "playwright";
import { z } from "zod";
// import { parseError } from "./error-parse";

import { fileURLToPath } from "url";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { scanConfig } from "./scan-config";
// import { time } from "console";
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
export type AccountRow = {
  address: string;
  nameTag: string;
};
export type TokenRow = {
  address: string;
  tokenName: string;
  tokenSymbol: string;
  tokenImage: string;
  website: string;
};
export type AccountRows = Array<AccountRow>;
export type TokenRows = Array<TokenRow>;
const bar1: SingleBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic,
);

export class AnyscanPuller {
  #baseUrl: string;
  #directoryName: string;
  #htmlParser: HtmlParser;
  public baseUrl: string;
  /**
   * @example
   * const etherscanPuller = new AnyscanPuller(etherscan);
   */
  public constructor(directoryName: keyof typeof scanConfig) {
    const baseUrl: string = scanConfig[directoryName].website;
    this.#baseUrl = z.string().url().startsWith("https://").parse(baseUrl);
    this.baseUrl = this.#baseUrl;
    const filenameRegex = /^[a-z0-9_\-.]+$/;
    this.#directoryName = z.string().regex(filenameRegex).parse(directoryName);
    this.#htmlParser = scanConfig[directoryName].htmlParser;
  }

  #fetchAllLabels = async (page: Page): Promise<AllLabels> => {
    const PAGE_URL = `${this.#baseUrl}/labelcloud`;

    const labelCloudHtml = await this.#fetchPageHtml(
      PAGE_URL,
      page,
      `button[data-url]`,
    );

    const allAnchors = z
      .array(z.string().url().startsWith("https://"))
      .parse(
        this.#htmlParser
          .selectAllLabels(labelCloudHtml)
          .map((anchor) => `${this.#baseUrl}${anchor}`),
      );
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

  async #fetchPageHtml(
    url: string,
    page: Page,
    waitForSelector: string,
  ): Promise<string> {
    // Navigate to the desired URL
    await page.goto(url);
    try {
      await page.waitForSelector(waitForSelector, { timeout: 5_000 });
      await this.#randomSleep();
    } catch (error) {
      // console.log(`❌ Error fetching page: ${url}`);
      // parseError(error);
    }
    // Get the HTML content of the entire page
    const pageContent = await page.content();
    return pageContent;
  }

  /**
   * Enters a username and password, but submit is not automated so that operator can submit captcha.
   */
  public async login(page: Page) {
    await page.goto(`${this.#baseUrl}/login`);
    await page.fill(
      "#ContentPlaceHolder1_txtUserName",
      process.env.ETHERSCAN_EMAIL || "",
    );
    await page.fill(
      "#ContentPlaceHolder1_txtPassword",
      process.env.ETHERSCAN_PASSWORD || "",
    );
    console.log(`🐢 Waiting for operator to complete login...`);
    // TODO: Update this deprecated function to instead use "page.waitForURL" (https://playwright.dev/docs/api/class-page#page-wait-for-url)
    await page.waitForNavigation({ timeout: 300_000 });
    console.log(`✅ Login completed!`);
  }

  #pullTokenRows = async (url: string, page: Page): Promise<TokenRows> => {
    const addressesHtml = await this.#fetchPageHtml(
      url,
      page,
      "tr > td > div > a",
    );
    const tokenRows = this.#htmlParser.selectAllTokenAddresses(addressesHtml);
    return tokenRows.map((tokenRow) => {
      const newTokenRow = {
        ...tokenRow,
        address: tokenRow.address.toLowerCase(),
      };
      return newTokenRow;
    });
  };

  #pullAccountRows = async (url: string, page: Page): Promise<AccountRows> => {
    const addressSelector = "tr > td > span a";
    const addressesHtml = await this.#fetchPageHtml(url, page, addressSelector);

    const $ = cheerio.load(addressesHtml);
    let accountRows: AccountRows = [];

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
        const subcatAddressesHtml = await this.#fetchPageHtml(
          subcatUrl,
          page,
          addressSelector,
        );
        const subcatAddresses = this.#htmlParser.selectAllAccountAddresses(
          subcatAddressesHtml,
          subcatId,
        );
        accountRows = [...accountRows, ...subcatAddresses];
      }
    } else {
      // console.log(`no navpills for ${url}`);
      accountRows = this.#htmlParser.selectAllAccountAddresses(
        addressesHtml,
        "0",
      );
    }
    return accountRows.map((accountRow) => {
      const newAccountRow = {
        ...accountRow,
        address: accountRow.address.toLowerCase(),
      };
      return newAccountRow;
    });
  };

  #sortTokenRows(tokenRows: TokenRows): TokenRows {
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

  #sortAccountRows(accountAddresses: AccountRows): AccountRows {
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
      const addressA = a.address;
      const addressB = b.address;
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

  async #randomSleep() {
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

    // await this.#login(page);
    const allLabels = await this.#fetchAllLabels(page);

    console.log(`\n🐌 Pulling all of tokens started...`);
    bar1.start(allLabels.tokens.length + allLabels.accounts.length - 1, 1);
    for (const [index, url] of allLabels.tokens.entries()) {
      bar1.update(index);
      // fetch all addresses from all tables
      const tokenRows = await this.#pullTokenRows(url, page);
      const labelName = z.string().parse(url.split("/").pop()?.split("?")[0]);

      if (tokenRows.length > 0) {
        const outputDirectory = path.join(rootDirectory, labelName);
        const sortedTokenRows = this.#sortTokenRows(tokenRows);
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory);
        }
        sortedTokenRows.forEach((tokenRow) => {
          tokenRow.tokenImage = `${this.#baseUrl}${tokenRow.tokenImage.substring(1)}`;
        });
        fs.writeFileSync(
          path.join(outputDirectory, "tokens.json"),
          JSON.stringify(sortedTokenRows),
          // JSON.stringify(
          //   {
          //     lastPulled: new Date().toISOString(),
          //     length: sortedTokenRows.length,
          //     data: sortedTokenRows,
          //   },
          //   null,
          //   2,
          // ),
        );
      }
    }
    console.log(`\n✅ Pulling all of tokens completed!`);
    console.log(`\n🐌 Pulling all of accounts started...`);
    for (const [index, url] of allLabels.accounts.entries()) {
      bar1.update(allLabels.tokens.length + index);
      // fetch all addresses from all tables
      const accountRows = await this.#pullAccountRows(url, page);
      const labelName = z.string().parse(url.split("/").pop()?.split("?")[0]);

      if (accountRows.length > 0) {
        const outputDirectory = path.join(rootDirectory, labelName);
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory);
        }
        const sortedAccountRows = this.#sortAccountRows(accountRows);
        fs.writeFileSync(
          path.join(outputDirectory, "accounts.json"),
          JSON.stringify(sortedAccountRows),
          // JSON.stringify(
          //   {
          //     lastPulled: new Date().toISOString(),
          //     length: sortedAccountRows.length,
          //     data: sortedAccountRows,
          //   },
          //   null,
          //   2,
          // ),
        );
      }
    }
    bar1.stop();
    console.log(`✅ Pulling all of accounts completed!`);
    console.log(`✅ Pulling all of ${this.#directoryName} completed!`);
  }
}
