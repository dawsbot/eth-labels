import * as cheerio from "cheerio";
import type { AccountRows } from "../ChainPuller";

export abstract class HtmlParser {
  /**
   * Find all the label urls on a labelcloud page
   * @param html - the labelcloud page content
   * @param baseUrl - the "scan" of interest.
   * @example
   * ```ts
   *  const allAnchors = htmlParser.selectAllLabels(
   *    labelCloudHtml
   * );
   * ```
   */
  #useApiForTokenRows: boolean = false;
  public setUseApiForTokenRows(useApiForTokenRows: boolean): void {
    this.#useApiForTokenRows = useApiForTokenRows;
  }
  public getUseApiForTokenRows(): boolean {
    return this.#useApiForTokenRows;
  }

  public selectAllLabels = (html: string): ReadonlyArray<string> => {
    const $ = cheerio.load(html);
    const parent = $("div > div > div.row.mb-3");

    let anchors: ReadonlyArray<string> = [];
    parent.find("a").each((index, element) => {
      const pathname = $(element).attr("href");
      if (typeof pathname !== "string") {
        console.log(`returning early because "${pathname}" is not a string`);
        return;
      }
      const maxRecordsLength = 10_000;
      const size = $(element).text();
      const regex = /\((.*?)\)/;
      const recordCount = Number(regex.exec(size)?.[1]);

      if (pathname.includes("tokens")) {
        // tokens has a max page size of 100. Labels with more rows than that
        // are paginated by ApiParser.fetchTokens, which keeps advancing the
        // "start" cursor until a page comes back with fewer than 100 rows.
        const href = `${pathname}?size=100&start=0`;
        anchors = [...anchors, href];
      } else if (recordCount < maxRecordsLength) {
        // if statement needed because otherwise we freeze forever on URL's like "beacon-depositor"
        const href = `${pathname}?size=${maxRecordsLength}`;
        anchors = [...anchors, href];
      }
    });
    return anchors;
  };

  public abstract selectAllAccountAddresses(
    html: string,
    subcatId: string,
  ): AccountRows;
}
