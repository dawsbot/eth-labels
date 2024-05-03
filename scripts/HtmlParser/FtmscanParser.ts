// import { PolygonscanHtmlParser } from './PolygonscanParser';
import * as cheerio from "cheerio";
import type { Page } from "playwright";
import type { AccountRow, AccountRows, TokenRow, TokenRows } from "../../types";
import { HtmlParser } from "./HtmlParser";

export class FtmScanHtmlParser extends HtmlParser {
  public constructor() {
    super();
    super.setUseApiForTokenRows(true);
  }
  public selectAllAccountAddresses(html: string): AccountRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: AccountRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[0]).find("a > span");

      const address = anchorWithDataBsTitle.attr("data-highlight-target") || "";
      const newAddressInfo: AccountRow = {
        address: address.trim(),
        nameTag: $(tableCells[1]).text().trim(),
      };

      addressesInfo = [...addressesInfo, newAddressInfo];
    });

    return addressesInfo;
  }

  public async login(page: Page, baseUrl: string) {
    await page.goto(`${baseUrl}/login`);
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
    await page.waitForNavigation({ timeout: 300000 });
    console.log(`✅ Login completed!`);
  }

  public selectAllTokenAddresses(html: string): TokenRows {
    const $ = cheerio.load(html);

    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: TokenRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[1]).find("a");

      const address =
        anchorWithDataBsTitle.find("span").attr("data-highlight-target") || "";

      if (typeof address !== "string") return;

      const tokenName =
        $(tableCells[2])
          .find("a > div > span.hash-tag.text-truncate > span")
          .text() ||
        $(tableCells[2]).find("a > div > span.hash-tag.text-truncate").text() ||
        "";
      const tokenSymbol =
        $(tableCells[2]).find("a > div > span.text-muted > span").text() ||
        $(tableCells[2])
          .find("a > div > span.text-muted")
          .text()
          .slice(1, -1) ||
        "";

      // let tokenImage = $(tableCells[2]).find("a > img").attr("src") || "";
      const website = ($(tableCells[5]).find("a").attr("href") || "") // had to change .attr("data-original-title") to .attr("href") for arbiscan
        .toLowerCase();
      // image path is relative to prepend with root URL
      // if (tokenImage.startsWith("/")) {
      //   tokenImage = `https://ftmscan.com${tokenImage}`;
      // }

      const tokenRow: TokenRow = {
        address: address.trim().toLowerCase(),
        tokenName: tokenName || "",
        tokenSymbol: tokenSymbol || "",
        website,
      };

      addressesInfo = [...addressesInfo, tokenRow];
    });
    return addressesInfo;
  }
}
