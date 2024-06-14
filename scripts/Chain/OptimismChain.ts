import { OptimismHtmlParser } from "../HtmlParser/OptimismHtmlParser";
import { Chain } from "./Chain";

export class OptimismChain extends Chain<OptimismHtmlParser> {
  public constructor() {
    const website = "https://optimistic.etherscan.io";
    const chainName = "optimism";
    const puller = new OptimismHtmlParser();
    super(website, chainName, puller);
  }
}
