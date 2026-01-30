import type { Address } from "viem";
import { z } from "zod";
import type { BrowserFetcher } from "../browser-fetch";
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
  protected browserFetcher: BrowserFetcher | null = null;

  public constructor(url: string) {
    this.baseUrl = url;
  }

  public setCookies(cookies: string): void {
    this.cookies = cookies;
  }

  public setBrowserFetcher(fetcher: BrowserFetcher): void {
    this.browserFetcher = fetcher;
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
    let tokens: TokenRows = [];
    let shouldKeepPulling = true;
    const MAX_PAGE_LENGTH = 100;

    while (shouldKeepPulling) {
      shouldKeepPulling = false;
      const tokenName = tokenUrl.split("/").reverse()[0].split("?")[0];
      const subcatId = tokenUrl.split("subcatid=")[1].split("&")[0];
      const start = tokenUrl.split("&start=")[1].split("&")[0];
      const url = `${baseUrl}/tokens.aspx/GetTokensBySubLabel`;
      const body = JSON.stringify({
        dataTableModel: {
          draw: 1,
          columns: [
            { data: "number", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
            { data: "contractAddress", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
            { data: "tokenName", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
            { data: "marketCap", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
            { data: "holders", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
            { data: "website", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
          ],
          order: [{ column: 3, dir: "desc" }],
          start: parseInt(start),
          length: MAX_PAGE_LENGTH,
          search: { value: "", regex: false },
        },
        labelModel: { label: tokenName, subCategoryId: subcatId },
      });

      let responseText: string;

      if (this.browserFetcher) {
        // Use browser to bypass Cloudflare
        responseText = await this.browserFetcher.postJson(url, body);
      } else {
        // Fallback: direct fetch (likely blocked by Cloudflare)
        const res = await fetch(url, {
          headers: {
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest",
            cookie: this.cookies,
          },
          body,
          method: "POST",
        });
        responseText = await res.text();
        if (responseText.includes("Just a moment...")) {
          console.error("\nCloudflare blocked the request. A running Chrome browser is required.");
          return process.exit(0);
        }
      }

      const parsed = tokenApiResponseSchema.parse(JSON.parse(responseText));
      const data = parsed.d.data;

      if (data.length === MAX_PAGE_LENGTH) {
        shouldKeepPulling = true;
      }

      const tokenRows = this.convertToTokenRows(data);
      const filtered = this.filterResponse(tokenRows);

      tokenUrl = `${tokenUrl.split("&start=")[0]}&start=${parseInt(start) + MAX_PAGE_LENGTH}&subcatid=${subcatId}`;
      tokens = [...tokens, ...filtered];
    }
    return tokens;
  }
}
