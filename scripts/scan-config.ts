import { ArbiscanChain } from "./Chain/ArbiscanChain";
import { BasescanChain } from "./Chain/BasescanChain";
import { BscscanChain } from "./Chain/BscscanChain";
import { CeloChain } from "./Chain/CeloChain";
import { EtherscanChain } from "./Chain/EtherscanChain";
import { GnosisChain } from "./Chain/GnosisChain";
import { OptimismChain } from "./Chain/OptimismChain";

export const scanConfig = [
  new EtherscanChain(),
  new OptimismChain(),
  new ArbiscanChain(),
  new BasescanChain(),
  new CeloChain(),
  new BscscanChain(),
  new GnosisChain(),
] as const;
