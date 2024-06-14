import { OptimismHtmlParser } from "../HtmlParser/OptimismHtmlParser";
import { Chain } from "./Chain";

export class GnosisChain extends Chain<OptimismHtmlParser> {
  public constructor() {
    const website = "https://gnosisscan.io/";
    const chainName = "gnosis";
    const puller = new OptimismHtmlParser();
    super(website, chainName, puller);
  }
}
