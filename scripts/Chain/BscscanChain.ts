import { BscscanHtmlParser } from "../HtmlParser/BscscanHtmlParser";
import { Chain } from "./Chain";

export class BscscanChain extends Chain {
  public constructor() {
    const website = "https://bscscan.com";
    const chainName = "bscscan";
    const puller = new BscscanHtmlParser();
    super(website, chainName, puller);
  }
}
