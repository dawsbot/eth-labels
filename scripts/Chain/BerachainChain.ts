import type { ApiParser } from "../ApiParser/ApiParser";
import { EtherscanApiParser } from "../ApiParser/EtherscanApiParser";
import { OptimismHtmlParser } from "../HtmlParser/OptimismHtmlParser";
import { Chain } from "./Chain";

export class BerachainChain extends Chain<ApiParser, OptimismHtmlParser> {
  public constructor() {
    const website = "https://berascan.com";
    const chainName = "berachain";
    const htmlPuller = new OptimismHtmlParser();
    const apiPuller = new EtherscanApiParser(website);
    super(website, chainName, apiPuller, htmlPuller);
  }
}
