import { Browser, Page, firefox } from "playwright";
import z from "zod";
import * as cheerio from "cheerio";
import { parseError } from "./error-parse";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
const fetchAllLabels = async (page: Page): Promise<AllLabels> => {
  const PAGE_URL = "https://etherscan.io/labelcloud";

  const labelCloudHtml = await fetchPageHtml(
    PAGE_URL,
    page,
    `button[data-url="0x-protocol"]`, // requires that 0x-protocol is one of the labels
  );

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

async function openBrowser(): Promise<{ browser: Browser; page: Page }> {
  const browser = await firefox.launch({ headless: false });
  // Create a new browser context
  const context = await browser.newContext();

  // Create a new page
  const page = await context.newPage();
  return { browser, page };
}
function closeBrowser(browser: Browser) {
  return browser.close();
}
async function fetchPageHtml(
  url: string,
  page: Page,
  waitForSelector: string,
): Promise<string> {
  // Navigate to the desired URL
  await page.goto(url);

  // console.log({ url });
  await page.waitForSelector(waitForSelector, { timeout: 10_000 });

  // Get the HTML content of the entire page
  const pageContent = await page.content();
  return pageContent;
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
    // console.log({ address });
    const newAddressInfo: AddressInfo = {
      address: z.string().parse(address),
      nameTag: $(tds[1]).text(),
    };

    addressesInfo = [...addressesInfo, newAddressInfo];
  });
  return addressesInfo;
}

(async () => {
  try {
    const { browser, page } = await openBrowser();
    const allLabels = await fetchAllLabels(page);
    for (const url of allLabels.accounts.slice(0, 3)) {
      // TODO: Select 100 instead of 25 per-page
      const addressesHtml = await fetchPageHtml(
        url,
        page,
        `a[aria-label="Copy Address"]`,
      );
      const allAddresses = selectAllAddresses(addressesHtml);
      console.dir({ url, allAddresses });
    }
    await closeBrowser(browser);
  } catch (error) {
    parseError(error);
    // without this the process hangs
    process.exit(1);
  }
})();
