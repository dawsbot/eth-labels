import * as cheerio from "cheerio";
import type { Page } from "playwright";
import { z } from "zod";
import type { TokenRow, TokenRows } from "./../AnyscanPuller";

const ApiResponseSchema = z.object({
  d: z
    .object({
      data: z.array(
        z
          .object({
            tokenName: z.string(),
            image: z.string().optional(),
            website: z.string(),
            contractAddress: z.string(),
          })
          .passthrough(),
      ),
    })
    .passthrough(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export abstract class ApiParser {
  protected readonly baseUrl: string;
  public constructor(url: string) {
    this.baseUrl = url;
  }

  public filterResponse(data: TokenRows): TokenRows {
    data.forEach((token: TokenRow) => {
      const $tokenName = cheerio.load(z.string().parse(token.name));
      const $tokenWebsite = cheerio.load(token.website);
      const $tokenAddress = cheerio.load(token.address);
      let title: string = z.string().parse($tokenName("a > div > span").html());
      let symbol: string = z
        .string()
        .parse($tokenName("a > div > span:nth-child(2)").html());
      const image: string = z.string().parse($tokenName("a > img").attr("src"));

      if (title.startsWith("<span")) {
        title = z
          .string()
          .parse($tokenName("a > div > span > span").attr("title"));
      }

      if (symbol.startsWith("(<span")) {
        symbol = z
          .string()
          .parse(
            $tokenName("a > div > span:nth-child(2) > span").attr("title"),
          );
      }

      if (symbol.startsWith("(")) {
        symbol = symbol.slice(1, -1);
      }

      const website = z.string().parse($tokenWebsite("a").attr("href"));
      const address = z
        .string()
        .parse($tokenAddress("a").attr("data-bs-title"));

      token.symbol = symbol;
      token.name = title;
      token.image = image;
      token.website = website;
      token.address = address;
    });
    return data;
  }

  public convertToTokenRows(data: ApiResponse): TokenRows {
    const tokens = data.d.data.map((obj) => ({
      name: obj.tokenName,
      website: obj.website,
      address: obj.contractAddress,
      symbol: null,
      image: null, // TODO: Add image parsing here
    }));
    return tokens;
  }

  public abstract fetchTokens(
    tokenName: string,
    cookie: string,
    page: Page,
    subcatId: string,
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
