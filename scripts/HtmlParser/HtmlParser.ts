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

  public abstract selectAllAccountAddresses(
    html: string,
    subcatId: string,
  ): AccountRows;
}
