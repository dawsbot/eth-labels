import { EtherscanApiParser } from "../ApiParser/EtherscanApiParser";
import { EtherscanHtmlParser } from "../HtmlParser/EtherscanParser";
import { Chain } from "./Chain";

export class EtherscanChain extends Chain<
  EtherscanApiParser,
  EtherscanHtmlParser
> {
  public constructor() {
    const website = "https://etherscan.io";
    const chainName = "etherscan";
    const apiPuller = new EtherscanApiParser(website);
    const htmlPuller = new EtherscanHtmlParser();

    super(website, chainName, apiPuller, htmlPuller);
  }
}
