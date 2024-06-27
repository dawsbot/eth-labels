import * as cheerio from "cheerio";
import { z } from "zod";
import type { TokenRow, TokenRows } from "../AnyscanPuller";
import { EtherscanHtmlParser } from "./EtherscanParser";

export class CeloScanParser extends EtherscanHtmlParser {
  public selectAllTokenAddresses(html: string): TokenRows {
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
      const tokenNameColumn = $(tableCells[2]).find("div > span").text().trim();

      const regex = /^(.*)\((.*)\)/;
      const match = tokenNameColumn.match(regex);
      const tokenName: string = (() => {
        if (regex.test(tokenNameColumn)) {
          return z.string().parse(match?.[1]);
        }
        return tokenNameColumn;
      })();
      const tokenSymbol: string = match?.[2] || "";
      const website = (
        $(tableCells[5]).find("a").attr("href") || ""
      ).toLowerCase();
      const tokenRow: TokenRow = {
        address: address.trim(),
        tokenName: tokenName || "",
        tokenSymbol: tokenSymbol,
        website,
      };

      addressesInfo = [...addressesInfo, tokenRow];
    });

    return addressesInfo;
  }
}
