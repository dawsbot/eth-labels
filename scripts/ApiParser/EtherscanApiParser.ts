import type { Page } from "playwright";
import type { TokenRows } from "./../AnyscanPuller";
import { ApiParser } from "./ApiParser";

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

export class EtherscanApiParser extends ApiParser {
  public async fetchTokens(
    tokenName: string,
    cookie: string,
    page: Page,
  ): Promise<TokenRows> {
    const baseUrl: string = this.baseUrl;
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
