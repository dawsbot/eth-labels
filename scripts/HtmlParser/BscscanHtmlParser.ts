import * as cheerio from "cheerio";
import type {
  AccountRow,
  AccountRows,
  TokenRow,
  TokenRows,
} from "../AnyscanPuller";
import { HtmlParser } from "./HtmlParser";

export class BscscanHtmlParser extends HtmlParser {
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
      const tokenSymbol = $(tableCells[2])
        .find("a > div > span.text-muted")
        .text()
        .slice(1, -1);
      const website = ($(tableCells[5]).find("a").attr("href") || "") // had to change .attr("data-original-title") to .attr("href") for arbiscan
        .toLowerCase();
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
}
