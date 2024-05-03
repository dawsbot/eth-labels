import { CeloScanParser } from "./HtmlParser/CeloScanParser";
import { EtherscanHtmlParser } from "./HtmlParser/EtherscanParser";
import { FtmScanHtmlParser } from "./HtmlParser/FtmscanParser";
import { OptimismHtmlParser } from "./HtmlParser/OptimismHtmlParser";

export const scanConfig = {
  etherscan: {
    website: "https://etherscan.io",
    htmlParser: new EtherscanHtmlParser(),
    useApiForTokenRows: false,
  },
  basescan: {
    website: "https://basescan.org",
    htmlParser: new OptimismHtmlParser(),
    useApiForTokenRows: false,
  },
  optimism: {
    website: "https://optimistic.etherscan.io",
    htmlParser: new OptimismHtmlParser(),
    useApiForTokenRows: false,
  },
  arbitrum: {
    website: "https://arbiscan.io",
    htmlParser: new OptimismHtmlParser(),
    useApiForTokenRows: false,
  },
  celo: {
    website: "https://celoscan.io",
    htmlParser: new CeloScanParser(),
    useApiForTokenRows: false,
  },
  ftmscan: {
    website: "https://ftmscan.com",
    htmlParser: new FtmScanHtmlParser(),
    useApiForTokenRows: true,
  },
} as const;
