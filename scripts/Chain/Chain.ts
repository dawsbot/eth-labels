import { z } from "zod";
import type { HtmlParser } from "../HtmlParser/HtmlParser";

export class Chain<T extends HtmlParser> {
  public website: string;
  public chainName: string;
  public chainId: number;
  public puller: T;

  #chainIdMapping: { [key: string]: number } = {
    etherscan: 1,
    optimism: 10,
    arbiscan: 42161,
    basescan: 8453,
    celo: 42220,
    bscscan: 56,
    gnosis: 100,
  };

  public constructor(website: string, chainName: string, puller: T) {
    this.website = z.string().url().startsWith("https://").parse(website);
    const filenameRegex = /^[a-z0-9_\-.]+$/;
    this.chainName = z.string().regex(filenameRegex).parse(chainName);
    this.puller = puller;
    this.chainId = this.#chainIdMapping[chainName];
  }
}
