import * as cheerio from "cheerio";
import { z } from "zod";
import type { TokenRow, TokenRows } from "../AnyscanPuller";
import { OptimismHtmlParser } from "./OptimismHtmlParser";

export class ArbitrumHtmlParser extends OptimismHtmlParser {
  public selectAllTokenAddresses(html: string): TokenRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: TokenRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[1]).find("a");

      const address = z.string().parse(anchorWithDataBsTitle.text());
      const tokenNameColumn = $(tableCells[2]).text().trim();

      let tokenName = "";
      let tokenSymbol = "";
      if (tokenNameColumn.includes("...")) {
        const tokenSymbolRegex = /.*\((.*)\)/;
        const match = tokenNameColumn.match(tokenSymbolRegex);
        tokenSymbol = match?.[1] as string;
        const tokenNameCell = tableCells[2];
        tokenName = z
          .string()
          .parse($(tokenNameCell).find("span").attr("data-original-title"));
      } else {
        const regex = /^(.*)\s\((.*)\)/;
        const match = tokenNameColumn.match(regex);
        tokenName = match?.[1] || "";
        tokenSymbol = match?.[2] || "";

        if (tokenName === "") {
          const newRegex = /^(.*)\n\s+\((.*)\)/;
          const newMatch = tokenNameColumn.match(newRegex);
          tokenName = newMatch?.[1] || "";
          tokenSymbol = newMatch?.[2] || "";
        }
      }

      const website = (
        $(tableCells[5]).find("a").attr("data-original-title") || ""
      ).toLowerCase();
      const tokenRow: TokenRow = {
        address: address.trim(),
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        website,
      };
      addressesInfo = [...addressesInfo, tokenRow];
    });

    return addressesInfo;
  }
}
