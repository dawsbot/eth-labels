import { z } from "zod";
import type { ApiParser } from "../ApiParser/ApiParser";

export class Chain<T extends ApiParser> {
  public website: string;
  public chainName: string;
  public puller: T;

  public constructor(website: string, chainName: string, puller: T) {
    this.website = z.string().url().startsWith("https://").parse(website);
    const filenameRegex = /^[a-z0-9_\-.]+$/;
    this.chainName = z.string().regex(filenameRegex).parse(chainName);
    this.puller = puller;
  }
}
