import type { Page } from "playwright";
import { z } from "zod";
import { CheerioParser } from "../CheerioParser";
import type { TokenRow, TokenRows } from "./../ChainPuller";

const ApiResponseSchema = z.object({
  d: z
    .object({
      data: z.array(
        z
          .object({
            tokenName: z.string().nullable(),
            tokenImage: z.string().optional(),
            website: z.string().nullable(),
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
      let title: string = "";
      let symbol: string = "";
      let tokenImage: string = "";
      if (token.tokenName) {
        cheerio.loadHtml(token.tokenName);
        title = z
          .string()
          .parse(cheerio.querySelector("a > div > span").html());
        try {
          symbol = z
            .string()
            .parse(cheerio.querySelector("a > div > span:nth-child(2)").html());
        } catch (e) {
          symbol = "";
        }
        tokenImage = z
          .string()
          .parse(cheerio.querySelector("a > img").attr("src"));
      }
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

      let website = "";
      if (token.website) {
        cheerio.loadHtml(token.website);
        website = z.string().parse(cheerio.querySelector("a").attr("href"));
      }
      cheerio.loadHtml(token.address);
      const address = z
        .string()
        .parse(cheerio.querySelector("a").attr("data-bs-title"));

      token.tokenSymbol = symbol === "" ? null : symbol;
      token.tokenName = title === "" ? null : title;
      token.tokenImage = tokenImage === "" ? undefined : tokenImage;
      token.website = website === "" ? null : website;
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

  public async fetchTokens(tokenUrl: string): Promise<TokenRows> {
    const baseUrl = this.baseUrl;
    const cookie = this.cookies;
    const page: Page = this.page;
    const tokenName = tokenUrl.split("/").reverse()[0].split("?")[0];
    const subcatId = tokenUrl.split("subcatid=")[1].split("&")[0];
    const start = tokenUrl.split("&start=")[1].split("&")[0];
    let shouldKeepPulling = false;

    const response = await page
      .evaluate(
        async (params) => {
          const url = `${params.baseUrl}/tokens.aspx/GetTokensBySubLabel`;
          const MAX_PAGE_LENGTH = 100;
          const data: Response = await fetch(url, {
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type": "application/json",
              priority: "u=1, i",
              cookie: params.cookie,
              Referer: params.tokenUrl,
            },

            body: `{"dataTableModel":{"draw":2,"columns":[{"data":"number","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"contractAddress","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"tokenName","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"marketCap","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"holders","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"website","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}}],"order":[{"column":3,"dir":"desc"}],"start":${params.start},"length":${MAX_PAGE_LENGTH},"search":{"value":"","regex":false}},"labelModel":{"label":"${params.tokenName}","subCategoryId":"${params.subcatId}"}}`,
            method: "POST",
          });
          const json = (await data.json()) as ApiResponse;
          return json;
        },
        { baseUrl, cookie, tokenName, subcatId, tokenUrl, start },
      )
      .then((res) => {
        if (res.d.data.length === 100) {
          shouldKeepPulling = true;
        }
        return res;
      })
      .then((res) => {
        this.verifyApiResponse(res);
        return res;
      })
      .then((verifiedRes) => this.convertToTokenRows(verifiedRes))
      .then((data) => this.filterResponse(data));

    if (shouldKeepPulling) {
      const nextTokenUrl = `${tokenUrl.split("&start=")[0]}&start=${parseInt(start) + 100}&subcatid=${subcatId}`;
      return response.concat(await this.fetchTokens(nextTokenUrl));
    } else {
      return response;
    }
  }

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
