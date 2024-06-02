import * as cheerio from "cheerio";
import type { Page } from "playwright";
import { z } from "zod";
import type { TokenRow, TokenRows } from "./../AnyscanPuller";

export type ApiResponse = {
  d: {
    data: Array<{
      tokenName: string;
      tokenImage?: string;
      website: string;
      contractAddress: string;
    }>;
  };
};

const ApiResponseSchema = z.object({
  d: z
    .object({
      data: z.array(
        z
          .object({
            tokenName: z.string(),
            tokenImage: z.string().optional(),
            website: z.string(),
            contractAddress: z.string(),
          })
          .passthrough(),
      ),
    })
    .passthrough(),
});

export abstract class ApiParser {
  protected readonly baseUrl: string;
  public constructor(url: string) {
    this.baseUrl = url;
  }

  public filterResponse(data: TokenRows): TokenRows {
    data.forEach((token: TokenRow) => {
      const $tokenName = cheerio.load(token.tokenName);
      const $tokenWebsite = cheerio.load(token.website);
      const $tokenAddress = cheerio.load(token.address);
      let title: string = z.string().parse($tokenName("a > div > span").html());
      let symbol: string = z
        .string()
        .parse($tokenName("a > div > span:nth-child(2)").html());
      const tokenImage: string = z
        .string()
        .parse($tokenName("a > img").attr("src"));

      if (title?.startsWith("<span")) {
        title = z
          .string()
          .parse($tokenName("a > div > span > span").attr("title"));
      }

      if (symbol?.startsWith("(<span")) {
        symbol = z
          .string()
          .parse(
            $tokenName("a > div > span:nth-child(2) > span").attr("title"),
          );
      }

      if (symbol?.startsWith("(")) {
        symbol = symbol.slice(1, -1);
      }

      const website = z.string().parse($tokenWebsite("a").attr("href"));
      const address = z
        .string()
        .parse($tokenAddress("a").attr("data-bs-title"));

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
      tokenSymbol: "",
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

  public verifyApiResponse(response: unknown): void {
    try {
      ApiResponseSchema.parse(response);
    } catch (error) {
      throw new Error(
        `Invalid response. The structure of the response is not as expected. Error: ${(error as Error).message}`,
      );
    }
  }
}
