import { CeloScanParser } from "./HtmlParser/CeloScanParser";
import { EtherscanHtmlParser } from "./HtmlParser/EtherscanParser";
import { OptimismHtmlParser } from "./HtmlParser/OptimismHtmlParser";
import { PolygonscanHtmlParser } from "./HtmlParser/PolygonscanParser";

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
  polygon: {
    website: "https://polygonscan.com",
    htmlParser: new PolygonscanHtmlParser(),
    useApiForTokenRows: true,
  },
} as const;
