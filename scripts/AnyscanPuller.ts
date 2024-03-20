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
  tokens: ReadonlyArray<string>;
  blocks: ReadonlyArray<string>;
};
type AddressInfo = {
  address: string;
  nameTag: string;
};
type AddressesInfo = Array<AddressInfo>;

export class AnyscanPuller {
  #baseUrl: string;
  /**
   * @example
   * const etherscanPuller = new AnyscanPuller('https:://etherscan.io');
   */
  constructor(baseUrl: string) {
    this.#baseUrl = z.string().url().startsWith("https://").parse(baseUrl);
  }

  private selectAllAnchors = (html: string): ReadonlyArray<string> => {
    const $ = cheerio.load(html);
    const parent = $(
      "#content > div.container-xxl.pb-12.mb-1.mt-4 > div > div > div.row.mb-3",
    );

    let anchors: ReadonlyArray<string> = [];
    parent.find("div > div > ul > li > a").each((index, element) => {
      const pathname = $(element).attr("href");
      const size = $(element).text();
      const regex = /\((.*?)\)/;
      const matches = Number(regex.exec(size)?.[1]);
      const maxRecordsLength = 3000;
      if (matches < maxRecordsLength) {
        const href = `${this.#baseUrl}${pathname}?size=${maxRecordsLength}`;
        if (typeof pathname === "string") {
          anchors = [...anchors, href];
        }
      }
    });
    return anchors;
  };

  private fetchAllLabelsEtherscan = async (page: Page): Promise<AllLabels> => {
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
          `url does not belong to "accounts" nor "tokens": "${url}"`,
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
    } catch (error) {
      parseError(error);
    }
    // Get the HTML content of the entire page
    const pageContent = await page.content();
    return pageContent;
  }

  private selectAllAddresses(
    html: string,
    subcatId: string = "0",
  ): AddressesInfo {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-${subcatId} > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: AddressesInfo = [];
    parent.find("tr").each((index, trElement) => {
      const tds = $(trElement).find("td");

      const anchorWithDataBsTitle = $(tds[0]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title") || "";
      const newAddressInfo: AddressInfo = {
        address: z.string().parse(address),
        nameTag: $(tds[1]).text(),
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

  private pullAllAddresses = async (url: string, page: Page) => {
    const addressesHtml = await this.fetchPageHtml(
      url,
      page,
      `a[aria-label="Copy Address"]`,
    );
    const $ = cheerio.load(addressesHtml);
    let allAddresses: AddressesInfo = [];

    const navPills = $(".nav-pills");
    // check if there are subcategories (nav-pills)
    if (navPills) {
      const anchors = navPills.find("li > a");
      const subcatIds: Array<string> = anchors.toArray().map((anchor) => {
        const subcatId = z.string().parse($(anchor).attr("val"));
        return subcatId;
        // return
        // console.log({ anchor });
        // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        // console.log({ anchor, ga: anchor.getAttribute });
        // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        // return z.string().parse(anchor.getAttribute("val"));
      });
      for (const subcatId of subcatIds) {
        const subcatUrl = `${url}&subcatid=${subcatId}`;
        const subcatAddressesHtml = await this.fetchPageHtml(
          subcatUrl,
          page,
          `a[aria-label="Copy Address"]`,
        );
        const subcatAddresses = this.selectAllAddresses(
          subcatAddressesHtml,
          subcatId,
        );
        allAddresses = [...allAddresses, ...subcatAddresses];
      }
    } else {
      allAddresses = this.selectAllAddresses(addressesHtml);
    }
    return allAddresses;
  };

  private sortAllAdresses(allAddresses: AddressesInfo) {
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

  public async fetchEtherscan(page: Page) {
    const randomDelay = Math.random() * 500 + 500;

    const outputDirectory = path.join(__dirname, "..", "data", "etherscan");
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    await this.login(page);
    const allLabels = await this.fetchAllLabelsEtherscan(page);

    for (const url of allLabels.accounts) {
      // delay between 0.5 and 1 seconds for processing
      await sleep(randomDelay);

      // fetch all addresses from all tables
      const allAddresses = await this.pullAllAddresses(url, page);
      const labelName = z.string().parse(url.split("/").pop()?.split("?")[0]);
      if (allAddresses.length > 0) {
        const sortedAddresses = this.sortAllAdresses(allAddresses);
        fs.writeFileSync(
          path.join(outputDirectory, `${labelName}.json`),
          JSON.stringify(sortedAddresses, null, 2),
        );
      }
      console.dir({
        url,
        allAddresses,
        length: allAddresses.length,
      });
    }
  }
}
