import { Browser, Page, firefox } from "playwright";
import z from "zod";
import * as cheerio from "cheerio";
import { parseError } from "./error-parse";
import "dotenv/config";
import fs from "fs";
import path from "path";

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
    let size = $(element).text();
    const regex = /\((.*?)\)/;
    //@ts-ignore
    const matches = Number(regex.exec(size)[1]);
    const maxRecordsLength = 3000;
    if (matches < maxRecordsLength) {
      const href = `https://etherscan.io${pathname}?size=${maxRecordsLength}`;
      if (typeof pathname === "string") {
        anchors = [...anchors, href];
      }
    }
  });
  return anchors;
};

type AllLabels = {
  accounts: Array<string>;
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
  // Create a new browser context with viewport options
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
  try {
    await page.waitForSelector(waitForSelector, { timeout: 15_000 });
  } catch (error) {
    parseError(error);
  }
  // Get the HTML content of the entire page
  const pageContent = await page.content();
  return pageContent;
}

type AddressInfo = {
  address: string;
  nameTag: string;
};
type AddressesInfo = Array<AddressInfo>;

function selectAllAddresses(
  html: string,
  subcatId: string = "0",
): AddressesInfo {
  const $ = cheerio.load(html);
  const selector = `#table-subcatid-${subcatId} > tbody`;
  console.log({ subcatId, selector });
  const tableElements = $(selector);
  const parent = tableElements.last();
  // const table0 = $("#table-subcatid-0 > tbody");
  // const table1 = $("#table-subcatid-1 > tbody");

  // const parent = table1.length > 0 ? table1 : table0;

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

async function signInToEtherscan(page: Page) {
  page.goto("https://etherscan.io/login");
  await page.fill(
    "#ContentPlaceHolder1_txtUserName",
    z.string().parse(process.env.ETHERSCAN_EMAIL),
  );
  await page.fill(
    "#ContentPlaceHolder1_txtPassword",
    z.string().parse(process.env.ETHERSCAN_PASSWORD),
  );
  await page.waitForNavigation();
}

async function pullFromTable(url, page) {
  const addressesHtml = await fetchPageHtml(
    url,
    page,
    `a[aria-label="Copy Address"]`,
  );
  let allAddresses: AddressesInfo = [];

  // check if there are subcategories (nav-pills)
  if (await page.$(".nav-pills")) {
    const navPills = await page.$(".nav-pills");
    if (navPills) {
      const subcatIds: Array<string> = await navPills.$$eval(
        "li > a",
        (anchors) => anchors.map((anchor) => anchor.getAttribute("val")),
      );
      for (const subcatId of subcatIds) {
        const subcatUrl = `${url}&subcatid=${subcatId}`;
        const subcatAddressesHtml = await fetchPageHtml(
          subcatUrl,
          page,
          `a[aria-label="Copy Address"]`,
        );
        const subcatAddresses = selectAllAddresses(
          subcatAddressesHtml,
          subcatId,
        );
        allAddresses = [...allAddresses, ...subcatAddresses];
      }
    }
  } else {
    allAddresses = selectAllAddresses(addressesHtml);
  }
  return allAddresses;
}
async function confirmLength(
  length: number,
  url: string,
  page: Page,
  labelName: string,
): Promise<boolean> {
  const textDiv = "#table-subcatid-0_info";
  let element = await page.$(textDiv);
  if (!element) {
    element = await page.$("#table-subcatid-1_info");
  }
  if (!element) {
    return 0 == length;
  }
  const text = await element.innerText();
  if (text.split(" ")[3].replace(",", "") != length.toString()) {
    fs.appendFileSync(
      path.join(__dirname, "..", "data", "error", `failed-list.txt`),
      `${labelName.padEnd(25)} --> expected: ${text.split(" ")[3]} got: ${length.toString()}\n`,
    );
    return false;
  }
  return true;
}
function printFailedSummary() {
  const failedListContent = fs.readFileSync(
    path.join(__dirname, "..", "data", "error", "failed-list.txt"),
    "utf-8",
  );
  console.log(
    "\n\n_________________________ FAILED_TESTS _________________________",
  );
  console.log(failedListContent); // show all failed labels
  console.log(
    `total failed labels: ${failedListContent.split("\n").length - 1}`,
  );
  console.log(
    "________________________ FAILED_TESTS_END ________________________",
  );
}

function sortAllAdresses(allAddresses: AddressesInfo) {
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

async function fetchEtherscan(page) {
  const sleepRange = 1 / 2;

  if (!fs.existsSync(path.join(__dirname, "..", "data", "etherscan"))) {
    fs.mkdirSync(path.join(__dirname, "..", "data", "etherscan"));
  }

  await signInToEtherscan(page);
  const allLabels = await fetchAllLabels(page);
  for (const url of allLabels.accounts) {
    await sleep(Math.random() * (sleepRange * 1000) + 500);
    const allAddresses = await pullFromTable(url, page);
    const labelName = url.split("/").pop()?.split("?")[0];
    if (allAddresses.length > 0) {
      const sortedAddresses = sortAllAdresses(allAddresses);
      fs.writeFileSync(
        path.join(__dirname, "..", "data", "etherscan", `${labelName}.json`),
        JSON.stringify(sortedAddresses, null, 2),
      );
    }
    // const lengthCheck = (await confirmLength(
    //   allAddresses.length,
    //   url,
    //   page,
    //   z.string().parse(labelName),
    // ))
    //   ? "PASSED"
    //   : "FAILED";

    console.dir({
      url,
      allAddresses,
      length: allAddresses.length,
      // lengthCheck: lengthCheck,
    });
  }
}

(async () => {
  try {
    const { browser, page } = await openBrowser();
    await fetchEtherscan(page);
    await closeBrowser(browser);
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
