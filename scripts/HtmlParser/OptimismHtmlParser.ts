import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { Address } from "viem";
import type {
  AccountRow,
  AccountRows,
  TokenRow,
  TokenRows,
} from "../ChainPuller";
import { HtmlParser } from "./HtmlParser";

const FULL_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/**
 * Prefer full addresses from attributes/href over truncated visible text
 * (newer *scan UIs render "0x1234...abcd" in the link text).
 */
function extractAddressFromAnchor(
  anchor: cheerio.Cheerio<Element>,
): string | null {
  const candidates = [
    anchor.attr("data-bs-title"),
    anchor.attr("data-original-title"),
    anchor.attr("data-highlight-target"),
    // Some explorers put the full address in a generic data attribute.
    anchor.attr("data"),
    anchor.attr("href")?.match(/\/address\/(0x[a-fA-F0-9]{40})/i)?.[1],
    anchor.text().trim(),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = candidate.trim();
    if (FULL_ADDRESS_RE.test(value)) {
      return value.toLowerCase();
    }
  }
  return null;
}

export class OptimismHtmlParser extends HtmlParser {
  public selectAllAccountAddresses(html: string): AccountRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-0 > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: AccountRows = [];
    parent.find("tr").each((_index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchor = $(tableCells[0]).find("a").first();
      const address = extractAddressFromAnchor(anchor);
      if (!address) return;

      const newAddressInfo: AccountRow = {
        address: address as Address,
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
    parent.find("tr").each((_index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchor = $(tableCells[1]).find("a").first();
      const address = extractAddressFromAnchor(anchor);
      if (!address) return;

      const tokenNameColumn = $(tableCells[2]).text().trim();

      const regex = /^(.*)\s\((.*)\)/;
      const match = tokenNameColumn.match(regex);
      const tokenName = match?.[1];
      const tokenSymbol = match?.[2];
      const website = (
        $(tableCells[5]).find("a").attr("data-original-title") || ""
      ).toLowerCase();
      const tokenRow: TokenRow = {
        address: address as Address,
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
