import type { ApiParser } from "../ApiParser/ApiParser";
import { EtherscanApiParser } from "../ApiParser/EtherscanApiParser";
import { ArbitrumHtmlParser } from "../HtmlParser/ArbitrumHtmlParser";
import { Chain } from "./Chain";

export class ArbiscanChain extends Chain<ApiParser, ArbitrumHtmlParser> {
  public constructor() {
    const website = "https://arbiscan.io";
    const chainName = "arbiscan";
    const htmlPuller = new ArbitrumHtmlParser();
    const apiPuller = new EtherscanApiParser(website);
    super(website, chainName, apiPuller, htmlPuller);
  }
}
