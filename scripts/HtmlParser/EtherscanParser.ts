import type { AccountRow, AccountRows } from "../ChainPuller";
import { CheerioParser } from "../CheerioParser";
import { HtmlParser } from "./HtmlParser";

export class EtherscanHtmlParser extends HtmlParser {
  public selectAllAccountAddresses(
    html: string,
    subcatId: string = "0",
  ): AccountRows {
    const cheerio = new CheerioParser();
    cheerio.loadHtml(html);
    const selector = `#table-subcatid-${subcatId} > tbody`;
    const tableElements = cheerio.querySelector(selector);
    const parent = tableElements.last();

    let addressesInfo: AccountRows = [];
    parent.find("tr").each((index, tableRow) => {
      const tableCells = cheerio.find(tableRow, "td");

      const anchorWithDataBsTitle = cheerio.find(
        tableCells[0],
        "a[data-bs-title]",
      );

      const address = anchorWithDataBsTitle.attr("data-bs-title");
      if (typeof address !== "string") {
        return;
      }
      const newAddressInfo: AccountRow = {
        address: address.trim(),
        nameTag: cheerio.text(tableCells[1]).trim(),
      };

      addressesInfo = [...addressesInfo, newAddressInfo];
    });

    return addressesInfo;
  }
}
