import * as cheerio from "cheerio";
import type { AccountRow, AccountRows } from "../AnyscanPuller";
import { HtmlParser } from "./HtmlParser";

export class EtherscanParser extends HtmlParser {
  public selectAllAccountAddresses(
    html: string,
    subcatId: string = "0",
  ): AccountRows {
    const $ = cheerio.load(html);
    const selector = `#table-subcatid-${subcatId} > tbody`;
    const tableElements = $(selector);
    const parent = tableElements.last();

    let addressesInfo: AccountRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = $(tableRow).find("td");

      const anchorWithDataBsTitle = $(tableCells[0]).find("a[data-bs-title]");

      const address = anchorWithDataBsTitle.attr("data-bs-title");
      if (typeof address !== "string") {
        return;
      }
      const newAddressInfo: AccountRow = {
        address: address.trim(),
        nameTag: $(tableCells[1]).text().trim(),
      };

      addressesInfo = [...addressesInfo, newAddressInfo];
    });

    return addressesInfo;
  }
}
