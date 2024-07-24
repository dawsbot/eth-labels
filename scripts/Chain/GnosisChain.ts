import type { ApiParser } from "../ApiParser/ApiParser";
import { EtherscanApiParser } from "../ApiParser/EtherscanApiParser";
import { OptimismHtmlParser } from "../HtmlParser/OptimismHtmlParser";
import { Chain } from "./Chain";

export class GnosisChain extends Chain<ApiParser, OptimismHtmlParser> {
  public constructor() {
    const website = "https://gnosisscan.io/";
    const chainName = "gnosis";
    const htmlPuller = new OptimismHtmlParser();
    const apiPuller = new EtherscanApiParser(website);
    super(website, chainName, apiPuller, htmlPuller);
  }
}
