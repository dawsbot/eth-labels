import { BasescanHtmlParser } from "./HtmlParser/BasescanParser";
import { EtherscanHtmlParser } from "./HtmlParser/EtherscanParser";
import { OptimismHtmlParser } from "./HtmlParser/OptimismHtmlParser";

export const scanConfig = {
  etherscan: {
    website: "https://etherscan.io",
    htmlParser: new EtherscanHtmlParser(),
  },
  basescan: {
    website: "https://basescan.org",
    htmlParser: new BasescanHtmlParser(),
  },
  optimism: {
    website: "https://optimistic.etherscan.io",
    htmlParser: new OptimismHtmlParser(),
  },
  arbitrum: {
    website: "https://arbiscan.io",
    htmlParser: new OptimismHtmlParser(),
  },
} as const;
