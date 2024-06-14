import { EtherscanHtmlParser } from "../HtmlParser/EtherscanParser";
import { Chain } from "./Chain";

export class EtherscanChain extends Chain<EtherscanHtmlParser> {
  public constructor() {
    const website = "https://etherscan.io";
    const chainName = "etherscan";
    const puller = new EtherscanHtmlParser();
    super(website, chainName, puller);
  }
}
