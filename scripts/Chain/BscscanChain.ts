import type { ApiParser } from "../ApiParser/ApiParser";
import { EtherscanApiParser } from "../ApiParser/EtherscanApiParser";
import { BscscanHtmlParser } from "../HtmlParser/BscscanHtmlParser";
import { Chain } from "./Chain";

export class BscscanChain extends Chain<ApiParser, BscscanHtmlParser> {
  public constructor() {
    const website = "https://bscscan.com";
    const chainName = "bscscan";
    const htmlPuller = new BscscanHtmlParser();
    const apiPuller = new EtherscanApiParser(website);
    super(website, chainName, apiPuller, htmlPuller);
  }
}
