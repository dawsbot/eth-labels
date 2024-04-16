import { ArbiscanHtmlParser } from "./HtmlParser/chainParsers/ArbiscanParser";
import { BasescanHtmlParser } from "./HtmlParser/chainParsers/BasescanParser";
import { BscscanHtmlParser } from "./HtmlParser/chainParsers/BscscanParser";
import { CeloScanParser } from "./HtmlParser/chainParsers/CeloScanParser";
import { EtherscanHtmlParser } from "./HtmlParser/chainParsers/EtherscanParser";
import { OptimismHtmlParser } from "./HtmlParser/chainParsers/OptimismHtmlParser";
import { PolygonscanHtmlParser } from "./HtmlParser/chainParsers/PolygonscanParser";

export const scanConfig = {
  etherscan: {
    website: "https://etherscan.io",
    htmlParser: new EtherscanHtmlParser(),
  },
  basescan: {
    website: "https://basescan.org",
    htmlParser: new BasescanHtmlParser(),
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
  optimism: {
    website: "https://optimistic.etherscan.io",
    htmlParser: new OptimismHtmlParser(),
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
