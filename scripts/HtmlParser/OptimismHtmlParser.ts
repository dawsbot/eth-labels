import * as cheerio from "cheerio";
import type { Address } from "viem";
import type {
  AccountRow,
  AccountRows,
  TokenRow,
  TokenRows,
} from "../ChainPuller";
import { HtmlParser } from "./HtmlParser";

export class OptimismHtmlParser extends HtmlParser {
  public selectAllAccountAddresses(html: string): AccountRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: AccountRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[0]).find("a");

      const address = anchorWithDataBsTitle.text();
      const newAddressInfo: AccountRow = {
        address: address.trim() as Address,
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

      const address = anchorWithDataBsTitle.text();
      if (typeof address !== "string") {
        return;
      }
      const tokenNameColumn = $(tableCells[2]).text().trim();

      const regex = /^(.*)\s\((.*)\)/;
      const match = tokenNameColumn.match(regex);
      const tokenName = match?.[1];
      const tokenSymbol = match?.[2];
      const website = (
        $(tableCells[5]).find("a").attr("data-original-title") || ""
      ).toLowerCase();
      const tokenRow: TokenRow = {
        address: address.trim() as Address,
        name: tokenName || "",
        symbol: tokenSymbol || "",
        website,
        image: null, // TODO: Add image parsing here
      };

      addressesInfo = [...addressesInfo, tokenRow];
    });

    return addressesInfo;
  }
}
