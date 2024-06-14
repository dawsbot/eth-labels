import { CeloScanParser } from "../HtmlParser/CeloScanParser";
import { Chain } from "./Chain";

export class CeloChain extends Chain<CeloScanParser> {
  public constructor() {
    const website = "https://celoscan.io";
    const chainName = "celo";
    const puller = new CeloScanParser();
    super(website, chainName, puller);
  }
}
