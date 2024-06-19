import type { Page } from "playwright";
import { z } from "zod";
import { CheerioParser } from "../CheerioParser";
import type { TokenRow, TokenRows } from "./../AnyscanPuller";

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

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export abstract class ApiParser {
  protected readonly baseUrl: string;
  protected cookies: string = "";
  protected page: Page = undefined as unknown as Page;

  public constructor(url: string) {
    this.baseUrl = url;
  }

  public setCookies(cookies: string): void {
    this.cookies = cookies;
  }

  public setPage(page: Page): void {
    this.page = page;
  }

  public filterResponse(data: TokenRows): TokenRows {
    data.forEach((token: TokenRow) => {
      const cheerio = new CheerioParser();
      cheerio.loadHtml(token.tokenName);
      let title: string = z
        .string()
        .parse(cheerio.querySelector("a > div > span").html());
      let symbol: string = z
        .string()
        .parse(cheerio.querySelector("a > div > span:nth-child(2)").html());
      const tokenImage: string = z
        .string()
        .parse(cheerio.querySelector("a > img").attr("src"));
      if (title.startsWith("<span")) {
        title = z
          .string()
          .parse(cheerio.querySelector("a > div > span > span").attr("title"));
      }
      if (symbol.startsWith("(<span")) {
        symbol = z
          .string()
          .parse(
            cheerio
              .querySelector("a > div > span:nth-child(2) > span")
              .attr("title"),
          );
      }
      if (symbol.startsWith("(")) {
        symbol = symbol.slice(1, -1);
      }

      cheerio.loadHtml(token.website);
      const website = z.string().parse(cheerio.querySelector("a").attr("href"));
      cheerio.loadHtml(token.address);
      const address = z
        .string()
        .parse(cheerio.querySelector("a").attr("data-bs-title"));

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
