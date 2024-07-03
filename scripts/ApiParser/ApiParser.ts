import type { Address } from "viem";
import { z } from "zod";
import { CheerioParser } from "../CheerioParser";
import type { TokenRow, TokenRows } from "./../ChainPuller";

export const tokenApiResponseSchema = z.object({
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

export type TokenApiResponse = z.infer<typeof tokenApiResponseSchema>;

export abstract class ApiParser {
  protected readonly baseUrl: string;
  protected cookies: string = "";

  public constructor(url: string) {
    this.baseUrl = url;
  }

  public setCookies(cookies: string): void {
    this.cookies = cookies;
  }

  public filterResponse(data: TokenRows): TokenRows {
    data.forEach((token: TokenRow) => {
      const cheerio = new CheerioParser();
      let title: string = "";
      let symbol: string = "";
      let tokenImage: string = "";
      if (token.name) {
        cheerio.loadHtml(token.name);
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

      token.symbol = symbol === "" ? null : symbol;
      token.name = title === "" ? null : title;
      token.image = tokenImage === "" ? null : tokenImage;
      token.website = website === "" ? null : website;
      token.address = address as Address;
    });
    return data;
  }

  public convertToTokenRows(data: TokenApiResponse["d"]["data"]): TokenRows {
    const tokens = data.map((obj) => ({
      name: obj.tokenName,
      website: obj.website,
      address: obj.contractAddress as Address,
      symbol: null,
      image: null, // TODO: Add image parsing here
    }));
    return tokens;
  }

  public async fetchTokens(tokenUrl: string): Promise<TokenRows> {
    const baseUrl = this.baseUrl;
    const cookie = this.cookies;
    let tokens: TokenRows = [];
    let shouldKeepPulling = true;
    const MAX_PAGE_LENGTH = 100;

    while (shouldKeepPulling) {
      shouldKeepPulling = false;
      const tokenName = tokenUrl.split("/").reverse()[0].split("?")[0];
      const subcatId = tokenUrl.split("subcatid=")[1].split("&")[0];
      const start = tokenUrl.split("&start=")[1].split("&")[0];
      const url = `${baseUrl}/tokens.aspx/GetTokensBySubLabel`;
      const body = `{"dataTableModel":{"draw":1,"columns":[{"data":"number","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"contractAddress","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"tokenName","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"marketCap","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"holders","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"website","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}}],"order":[{"column":3,"dir":"desc"}],"start":${start},"length":${MAX_PAGE_LENGTH},"search":{"value":"","regex":false}},"labelModel":{"label":"${tokenName}","subCategoryId":"${subcatId}"}}`;

      const response: TokenRows = await fetch(url, {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-model": '""',
          "sec-ch-ua-platform": '"macOS"',
          "sec-ch-ua-platform-version": '"14.5.0"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-requested-with": "XMLHttpRequest",
          cookie,
          Referer: tokenUrl,
          "Referrer-Policy": "origin-when-cross-origin",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
        body,
        method: "POST",
      })
        .then(async (res) => {
          const text = await res.text();
          if (text.includes("Just a moment...")) {
            console.error(
              '\nAPI rate limit exceeded for POST to "GetTokensBySubLabel", come back later',
            );
            return process.exit(0);
          }

          return res.json();
        })
        .then((res) => tokenApiResponseSchema.parse(res))
        .then((res) => res.d.data)
        .then((data) => {
          if (data.length === MAX_PAGE_LENGTH) {
            shouldKeepPulling = true;
          }
          return data;
        })
        .then((data) => this.convertToTokenRows(data))
        .then((data) => this.filterResponse(data));

      tokenUrl = `${tokenUrl.split("&start=")[0]}&start=${parseInt(start) + MAX_PAGE_LENGTH}&subcatid=${subcatId}`;
      tokens = [...tokens, ...response];
    }
    return tokens;
  }
}
