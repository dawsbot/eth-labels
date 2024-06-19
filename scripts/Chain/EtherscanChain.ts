import { EtherscanApiParser } from "../ApiParser/EtherscanApiParser";
import { Chain } from "./Chain";

export class EtherscanChain extends Chain<EtherscanApiParser> {
  public constructor() {
    const website = "https://etherscan.io";
    const chainName = "etherscan";
    const puller = new EtherscanApiParser(website);
    super(website, chainName, puller);
  }
}
