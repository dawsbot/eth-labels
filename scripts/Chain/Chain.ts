import { z } from "zod";
import type { ApiParser } from "../ApiParser/ApiParser";
import type { HtmlParser } from "../HtmlParser/HtmlParser";

export class Chain<T extends ApiParser, T2 extends HtmlParser> {
  public website: string;
  public chainName: string;
  public chainId: number;
  public apiPuller: T;
  public htmlPuller: T2;

  public static chainIdMapping: { [key: string]: number } = {
    etherscan: 1,
    optimism: 10,
    arbiscan: 42161,
    basescan: 8453,
    celo: 42220,
    bscscan: 56,
    gnosis: 100,
  };

  public constructor(
    website: string,
    chainName: string,
    apiPuller: T,
    htmlPuller: T2,
    chainId: number,
  ) {
    this.website = z.string().url().startsWith("https://").parse(website);
    const filenameRegex = /^[a-z0-9_\-.]+$/;
    this.chainName = z.string().regex(filenameRegex).parse(chainName);
    this.apiPuller = apiPuller;
    this.htmlPuller = htmlPuller;
    this.chainId = chainId;
  }
}
