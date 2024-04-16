import { ArbiscanHtmlParser } from "./HtmlParser/ArbiscanParser";
import { BasescanHtmlParser } from "./HtmlParser/BasescanParser";
import { BscscanHtmlParser } from "./HtmlParser/BscscanHtmlParser";
import { CeloScanParser } from "./HtmlParser/CeloScanParser";
import { EtherscanHtmlParser } from "./HtmlParser/EtherscanParser";
import { OptimismHtmlParser } from "./HtmlParser/OptimismHtmlParser";
import { PolygonscanHtmlParser } from "./HtmlParser/PolygonscanHtmlParser";

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
  polygonscan: {
    website: "https://polygonscan.com",
    htmlParser: new PolygonscanHtmlParser(),
  },
  bscscan: {
    website: "https://bscscan.com",
    htmlParser: new BscscanHtmlParser(),
  },
  gnosisscan: {
    website: "https://gnosisscan.io",
    htmlParser: new OptimismHtmlParser(),
  },
  ftmscan: {
    website: "https://ftmscan.com",
    htmlParser: new PolygonscanHtmlParser(),
  },
  arbitrum: {
    website: "https://arbiscan.io",
    htmlParser: new ArbiscanHtmlParser(),
  },
  celo: {
    website: "https://celoscan.io",
    htmlParser: new CeloScanParser(),
  },
} as const;
