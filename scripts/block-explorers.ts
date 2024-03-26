import { BasescanParser } from "./HtmlParser/BasescanParser";
import { EtherscanParser } from "./HtmlParser/EtherscanParser";

export const scanConfig = {
  etherscan: {
    website: "https://etherscan.io",
    htmlParser: new EtherscanParser(),
  },
  basescan: {
    website: "https://basescan.org",
    htmlParser: new BasescanParser(),
  },
};
