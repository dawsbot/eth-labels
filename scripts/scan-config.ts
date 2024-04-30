import { BscscanHtmlParser } from "./HtmlParser/BscscanHtmlParser";
import { CeloScanParser } from "./HtmlParser/CeloScanParser";
import { EtherscanHtmlParser } from "./HtmlParser/EtherscanParser";
import { OptimismHtmlParser } from "./HtmlParser/OptimismHtmlParser";

export const scanConfig = {
  etherscan: {
    website: "https://etherscan.io",
    htmlParser: new EtherscanHtmlParser(),
  },
  basescan: {
    website: "https://basescan.org",
    htmlParser: new OptimismHtmlParser(),
  },
  optimism: {
    website: "https://optimistic.etherscan.io",
    htmlParser: new OptimismHtmlParser(),
  },
  arbitrum: {
    website: "https://arbiscan.io",
    htmlParser: new OptimismHtmlParser(),
  },
  celo: {
    website: "https://celoscan.io",
    htmlParser: new CeloScanParser(),
  },
  bscscan: {
    website: "https://bscscan.com",
    htmlParser: new BscscanHtmlParser(),
  },
  gnosis: {
    website: "https://gnosisscan.io/",
    htmlParser: new OptimismHtmlParser(),
  },
} as const;
