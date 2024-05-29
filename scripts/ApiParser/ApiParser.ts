import * as cheerio from "cheerio";
import type { Page } from "playwright";
import { z } from "zod";
import type { TokenRow, TokenRows } from "./../AnyscanPuller";

type ApiResponse = {
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

export class ApiParser {
  #baseUrl: string;
  public constructor(url: string) {
    this.#baseUrl = url;
  }
  private filterResponse(data: TokenRows): TokenRows {
    data.forEach((token: TokenRow) => {
      const $1 = cheerio.load(token.tokenName);
      let title: string = $1("a > div > span").html() || "";
      let symbol: string = $1("a > div > span:nth-child(2)").html() || "";
      const tokenImage: string = $1("a > img").attr("src") || "";

      if (title?.startsWith("<span")) {
        title = title.split(" ").slice(4).join(" ");
        const regex = /"(.*?)"/g;
        const matches = title.match(regex)?.map((match) => match.slice(1, -1));
        title = matches?.join() || ""; // Add null check and assign empty string as fallback
      }
      if (symbol?.startsWith("(<span")) {
        symbol = symbol.split(" ").slice(4).join(" ");
        const regex = /"(.*?)"/g;
        const matches = symbol.match(regex)?.map((match) => match.slice(1, -1));
        symbol = matches?.join() || ""; // Add null check and assign empty string as fallback
      } else if (symbol?.startsWith("(")) {
        symbol = symbol.slice(1, -1);
      }
      token.tokenSymbol = symbol;
      token.tokenName = title;
      token.tokenImage = tokenImage;
      const $2 = cheerio.load(token.website);
      token.website = $2("a").attr("href") || token.website;
      const $3 = cheerio.load(z.string().parse(token.address));
      token.address = $3("a").attr("data-bs-title") || token.address;
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

  public async fetchTokens(
    tokenName: string,
    cookie: string,
    page: Page,
  ): Promise<TokenRows> {
    const baseUrl = this.#baseUrl;
    const response: ApiResponse = await page.evaluate(
      async (params: {
        baseUrl: string;
        cookie: string;
        tokenName: string;
      }) => {
        const data: Response = await fetch(
          `${params.baseUrl}/tokens.aspx/GetTokensBySubLabel`,
          {
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type": "application/json",
              priority: "u=1, i",
              cookie: params.cookie,
              Referer: `${params.baseUrl}${params.tokenName}&subcatid=1`,
            },

            body: `{"dataTableModel":{"draw":2,"columns":[{"data":"number","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"contractAddress","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"tokenName","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"marketCap","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"holders","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"website","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}}],"order":[{"column":3,"dir":"desc"}],"start":0,"length":100,"search":{"value":"","regex":false}},"labelModel":{"label":"${params.tokenName.split("/")[3].split("?")[0]}","subCategoryId":"1"}}`,
            method: "POST",
          },
        );
        const json: ApiResponse = (await data.json()) as ApiResponse;
        return json;
      },
      { baseUrl, cookie, tokenName },
    );
    const tokensRaw = this.convertToTokenRows(response);
    const tokens: TokenRows = this.filterResponse(tokensRaw);
    return tokens;
  }
}
