import * as puppeteer from "puppeteer-core";
import z from "zod";
import * as cheerio from "cheerio";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const selectAllAnchors = (html: string): ReadonlyArray<string> => {
  const $ = cheerio.load(html);
  const parent = $(
    "#content > div.container-xxl.pb-12.mb-1.mt-4 > div > div > div.row.mb-3"
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

export const fetchAllLabels = async (): Promise<ReadonlyArray<string>> => {
  const PAGE_URL = "https://etherscan.io/labelcloud";
  const labelCloudHtml = await fetchPageHtml(PAGE_URL);

  const allAnchors = selectAllAnchors(labelCloudHtml);
  return allAnchors;
};

async function fetchPageHtml(url: string): Promise<string> {
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "ws://127.0.0.1:9222/devtools/browser/3ba21c76-5840-4dd8-9f24-1ffeb24f88f6",
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle0" });

  // this header is the top of all Etherscan pages
  await page.waitForSelector("#masterHeader");
  // await sleep(3_000);
  const addressesHtml = await page.content();

  await browser.close();

  return addressesHtml;
}

type AddressInfo = {
  address: string;
  nameTag: string;
};
type AddressesInfo = ReadonlyArray<AddressInfo>;

function selectAllAddresses(html: string): AddressesInfo {
  const $ = cheerio.load(html);
  const parent = $("#table-subcatid-1 > tbody");

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
  const url = "https://etherscan.io/accounts/label/augur";
  const addressesHtml = await fetchPageHtml(url);
  const allAddresses = selectAllAddresses(addressesHtml);
  console.dir(allAddresses);
})();
