import { ArbiscanChain } from "./Chain/ArbiscanChain";
import { AvalancheChain } from "./Chain/AvalancheChain";
import { BasescanChain } from "./Chain/BasescanChain";
import { BerachainChain } from "./Chain/BerachainChain";
import { BlastChain } from "./Chain/BlastChain";
import { BscscanChain } from "./Chain/BscscanChain";
import { CeloChain } from "./Chain/CeloChain";
import { EtherscanChain } from "./Chain/EtherscanChain";
import { GnosisChain } from "./Chain/GnosisChain";
import { LineaChain } from "./Chain/LineaChain";
import { MantleChain } from "./Chain/MantleChain";
import { OptimismChain } from "./Chain/OptimismChain";
import { PolygonChain } from "./Chain/PolygonChain";
import { ScrollChain } from "./Chain/ScrollChain";
import { WorldChain } from "./Chain/WorldChain";

export const scanConfig = [
  new EtherscanChain(),
  new OptimismChain(),
  new ArbiscanChain(),
  new BasescanChain(),
  new CeloChain(),
  new BscscanChain(),
  new GnosisChain(),
  new AvalancheChain(),
  new PolygonChain(),
  new MantleChain(),
  new ScrollChain(),
  new LineaChain(),
  new BlastChain(),
  new BerachainChain(),
  new WorldChain(),
] as const;
