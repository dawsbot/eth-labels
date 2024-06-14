import { ArbitrumHtmlParser } from "../HtmlParser/ArbitrumHtmlParser";
import { Chain } from "./Chain";

export class ArbiscanChain extends Chain {
  public constructor() {
    const website = "https://arbiscan.io";
    const chainName = "arbiscan";
    const puller = new ArbitrumHtmlParser();
    super(website, chainName, puller);
  }
}
