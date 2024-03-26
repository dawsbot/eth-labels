import * as cheerio from "cheerio";
import type { AccountRow, AccountRows } from "../AnyscanPuller";
import { HtmlParser } from "./HtmlParser";

export class BasescanParser extends HtmlParser {
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
        address: address.trim(),
        nameTag: $(tableCells[1]).text().trim(),
      };

      addressesInfo = [...addressesInfo, newAddressInfo];
    });

    return addressesInfo;
  }
}
