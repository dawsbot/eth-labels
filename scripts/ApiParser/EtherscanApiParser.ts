import type { Page } from "playwright";
import type { TokenRows } from "./../AnyscanPuller";
import type { ApiResponse } from "./ApiParser";
import { ApiParser } from "./ApiParser";

export class EtherscanApiParser extends ApiParser {
  public async fetchTokens(
    tokenName: string,
    cookie: string,
    page: Page,
  ): Promise<TokenRows> {
    const baseUrl: string = this.baseUrl;
    const response: TokenRows = await page
      .evaluate(
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

              body: `{"dataTableModel":{"draw":2,"columns":[{"data":"number","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"contractAddress","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"tokenName","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"marketCap","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"holders","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"website","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}}],"order":[{"column":3,"dir":"desc"}],"start":0,"length":100,"search":{"value":"","regex":false}},"labelModel":{"label":"${params.tokenName.split("/")[3].split("?")[0]}","subCategoryId":"0"}}`,
              method: "POST",
            },
          );
          const json: ApiResponse = (await data.json()) as ApiResponse;
          return json;
        },
        { baseUrl, cookie, tokenName },
      )
      .then((received) => {
        received.d.data = received.d.data.filter((token) => {
          if (token.website === null || token.tokenName === null) {
            return false;
          }
          return true;
        });
        return received;
      })
      .then((received) => {
        this.verifyApiResponse(received);
        return received;
      })
      .then((verifiedResponse) => this.convertToTokenRows(verifiedResponse))
      .then((tokensRaw) => {
        console.log(tokenName.split("/")[3].split("?")[0], tokensRaw.length);
        return tokensRaw;
      })
      .then((tokensRaw) => this.filterResponse(tokensRaw))
      .catch((error) => {
        console.log(error, tokenName.split("/")[3].split("?")[0]);
        return [];
      });

    return response;
  }
}
