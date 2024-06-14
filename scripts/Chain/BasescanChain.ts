import { OptimismHtmlParser } from "../HtmlParser/OptimismHtmlParser";
import { Chain } from "./Chain";

export class BasescanChain extends Chain {
  public constructor() {
    const website = "https://basescan.org";
    const chainName = "basescan";
    const puller = new OptimismHtmlParser();
    super(website, chainName, puller);
  }
}
