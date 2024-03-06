import * as puppeteer from "puppeteer-core";
import z from "zod";
import * as cheerio from "cheerio";
import { hostname } from "os";
import { parseError } from "./error-parse";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main(): Promise<void> {
  // const wsUrl = await spawnBrowser();
}
const selectAllAnchors = (html: string): ReadonlyArray<string> => {
  const $ = cheerio.load(html);
  const parent = $(
    "#content > div.container-xxl.pb-12.mb-1.mt-4 > div > div > div.row.mb-3",
  );

  let anchors: ReadonlyArray<string> = [];
  parent.find("div > div > ul > li > a").each((index, element) => {
    const pathname = $(element).attr("href");
    const href = `https://etherscan.io${pathname}`;
    if (typeof pathname === "string") {
      anchors = [...anchors, href];
    }
  });
  return anchors;
};

type AllLabels = {
  accounts: ReadonlyArray<string>;
  tokens: ReadonlyArray<string>;
  blocks: ReadonlyArray<string>;
};
export const fetchAllLabels = async (
  browser: puppeteer.Browser,
): Promise<AllLabels> => {
  const PAGE_URL = "https://etherscan.io/labelcloud";

  const labelCloudHtml = await fetchPageHtml(PAGE_URL, browser);

  const allAnchors = selectAllAnchors(labelCloudHtml);
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

function openBrowser(): Promise<puppeteer.Browser> {
  return puppeteer.connect({
    browserWSEndpoint: `ws://${hostname()}:9222/devtools/browser/af1a102b-63b1-41f8-bb83-7e4f6d4d1f22`,
  });
}
function closeBrowser(browser: puppeteer.Browser) {
  return browser.close();
}
async function fetchPageHtml(
  url: string,
  browser: puppeteer.Browser,
): Promise<string> {
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle0" });
  // this header is the top of all Etherscan pages
  await page.waitForSelector("#content");
  await sleep(1_000);
  // await page.waitForSelector("#table-subcatid-0_wrapper");

  const addressesHtml = await page.content();
  await page.close();

  return addressesHtml;
}

type AddressInfo = {
  address: string;
  nameTag: string;
};
type AddressesInfo = ReadonlyArray<AddressInfo>;

function selectAllAddresses(html: string): AddressesInfo {
  const $ = cheerio.load(html);
  const table0 = $("#table-subcatid-0 > tbody");
  const table1 = $("#table-subcatid-1 > tbody");
  const parent = table0.length > 0 ? table0 : table1;

  let addressesInfo: AddressesInfo = [];
  parent.find("tr").each((index, trElement) => {
    const tds = $(trElement).find("td");

    const anchorWithDataBsTitle = $(tds[0]).find("a[data-bs-title]");

    const address = anchorWithDataBsTitle.attr("data-bs-title");
    console.log({ address });
    const newAddressInfo: AddressInfo = {
      address: z.string().parse(address),
      nameTag: $(tds[1]).text(),
    };

    addressesInfo = [...addressesInfo, newAddressInfo];
  });
  return addressesInfo;
}

(async () => {
  // await fetchAllLabels();
  try {
    const browser = await openBrowser();
    const allLabels = await fetchAllLabels(browser);
    // console.log(allLabels);
    for (const url of allLabels.accounts.slice(0, 3)) {
      // TODO: Select 100 instead of 25 per-page
      const addressesHtml = await fetchPageHtml(url, browser);
      const allAddresses = selectAllAddresses(addressesHtml);
      console.dir({ url, allAddresses });
    }
    await closeBrowser(browser);
  } catch (error) {
    parseError(error);
  }
})();
