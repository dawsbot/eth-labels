import * as cheerio from "cheerio";
import type { Page } from "playwright";
import { z } from "zod";
import type { TokenRow, TokenRows } from "./../AnyscanPuller";

export type ApiResponse = {
  d: {
    data: Array<{
      tokenName: string;
      tokenSymbol: string;
      tokenImage?: string;
      website: string;
      contractAddress: string;
    }>;
  };
};

export abstract class ApiParser {
  protected readonly baseUrl: string;
  public constructor(url: string) {
    this.baseUrl = url;
  }

  public filterResponse(data: TokenRows): TokenRows {
    data.forEach((token: TokenRow) => {
      const $1 = cheerio.load(token.tokenName);
      const $2 = cheerio.load(token.website);
      const $3 = cheerio.load(z.string().parse(token.address));

      let title: string = $1("a > div > span").html() || "";
      let symbol: string = $1("a > div > span:nth-child(2)").html() || "";
      const tokenImage: string = $1("a > img").attr("src") || "";

      if (title?.startsWith("<span")) {
        title = title.split(" ").slice(4).join(" ");
        const regex = /"(.*?)"/g;
        const matches = title.match(regex)?.map((match) => match.slice(1, -1));
        title = matches?.join() || "";
      }

      // filter out the cases for different formats of token symbol
      if (symbol?.startsWith("(<span")) {
        symbol = symbol.split(" ").slice(4).join(" ");
        const regex = /"(.*?)"/g;
        const matches = symbol.match(regex)?.map((match) => match.slice(1, -1));
        symbol = matches?.join() || "";
      } else if (symbol?.startsWith("(")) {
        symbol = symbol.slice(1, -1);
      }

      const website = $2("a").attr("href") || token.website;
      const address = $3("a").attr("data-bs-title") || token.address;

      token.tokenSymbol = symbol;
      token.tokenName = title;
      token.tokenImage = tokenImage;
      token.website = website;
      token.address = address;
    });
    return data;
  }

  public convertToTokenRows(data: ApiResponse): TokenRows {
    const tokens = data.d.data.map((obj) => ({
      tokenName: obj.tokenName,
      tokenSymbol: obj.tokenSymbol,
      website: obj.website,
      address: obj.contractAddress,
    }));
    return tokens;
  }

  public abstract fetchTokens(
    tokenName: string,
    cookie: string,
    page: Page,
  ): Promise<TokenRows>;
}
