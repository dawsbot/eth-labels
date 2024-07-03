import type { ApiParser } from "../ApiParser/ApiParser";
import { EtherscanApiParser } from "../ApiParser/EtherscanApiParser";
import { CeloScanParser } from "../HtmlParser/CeloScanParser";
import { Chain } from "./Chain";

export class CeloChain extends Chain<ApiParser, CeloScanParser> {
  public constructor() {
    const website = "https://celoscan.io";
    const chainName = "celo";
    const htmlPuller = new CeloScanParser();
    const apiPuller = new EtherscanApiParser(website);
    super(website, chainName, apiPuller, htmlPuller);
  }
}
