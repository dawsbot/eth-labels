import { z } from "zod";
import type { HtmlParser } from "../HtmlParser/HtmlParser";

export class Chain {
  public website: string;
  public chainName: string;
  public puller: HtmlParser;

  public constructor(website: string, chainName: string, puller: HtmlParser) {
    this.website = z.string().url().startsWith("https://").parse(website);
    const filenameRegex = /^[a-z0-9_\-.]+$/;
    this.chainName = z.string().regex(filenameRegex).parse(chainName);
    this.puller = puller;
  }
}
