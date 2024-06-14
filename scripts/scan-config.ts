import { ArbiscanChain } from "./Chain/ArbiscanChain";
import { BasescanChain } from "./Chain/BasescanChain";
import { BscscanChain } from "./Chain/BscscanChain";
import { CeloChain } from "./Chain/CeloChain";
import type { Chain } from "./Chain/Chain";
import { EtherscanChain } from "./Chain/EtherscanChain";
import { GnosisChain } from "./Chain/GnosisChain";
import { OptimismChain } from "./Chain/OptimismChain";

export const scanConfig: ReadonlyArray<Chain> = [
  new EtherscanChain(),
  new BasescanChain(),
  new OptimismChain(),
  new ArbiscanChain(),
  new CeloChain(),
  new BscscanChain(),
  new GnosisChain(),
];

// export const scanConfig = {
//   etherscan: {
//     // website: "https://etherscan.io",
//     htmlParser: new EtherscanHtmlParser(),
//   },
//   basescan: {
//     website: "https://basescan.org",
//     htmlParser: new OptimismHtmlParser(),
//   },
//   optimism: {
//     website: "https://optimistic.etherscan.io",
//     htmlParser: new OptimismHtmlParser(),
//   },
//   arbiscan: {
//     website: "https://arbiscan.io",
//     htmlParser: new ArbitrumHtmlParser(),
//   },
//   celo: {
//     website: "https://celoscan.io",
//     htmlParser: new CeloScanParser(),
//   },
//   bscscan: {
//     website: "https://bscscan.com",
//     htmlParser: new BscscanHtmlParser(),
//   },
//   gnosis: {
//     website: "https://gnosisscan.io/",
//     htmlParser: new OptimismHtmlParser(),
//   },
// } as const;
