import type { Page } from "playwright";
import type { TokenRows } from "./../AnyscanPuller";
import type { ApiResponse } from "./ApiParser";
import { ApiParser } from "./ApiParser";

export class EtherscanApiParser extends ApiParser {
  public async fetchTokens(
    tokenUrl: string,
    subcatId: string,
  ): Promise<TokenRows> {
    const baseUrl = this.baseUrl;
    const cookie = this.cookies;
    const page: Page = this.page;
    const tokenName = tokenUrl.split("/")[5].split("?")[0];
    const response: TokenRows = await page
      .evaluate(
        async (params: {
          baseUrl: string;
          tokenName: string;
          cookie: string;
          subcatId: string;
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
                Referer: `${params.baseUrl}${params.tokenName}&subcatid=${params.subcatId}`,
              },

              body: `{"dataTableModel":{"draw":2,"columns":[{"data":"number","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"contractAddress","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"tokenName","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"marketCap","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"holders","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"website","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}}],"order":[{"column":3,"dir":"desc"}],"start":0,"length":100,"search":{"value":"","regex":false}},"labelModel":{"label":"${params.tokenName}","subCategoryId":"${params.subcatId}"}}`,
              method: "POST",
            },
          );
          const json: ApiResponse = (await data.json()) as ApiResponse;
          return json;
        },
        { baseUrl, cookie, tokenName, subcatId },
      )
      .then((res) => {
        res.d.data = res.d.data.filter((token) => {
          if (token.website === null || token.tokenName === null) {
            return false;
          }
          return true;
        });
        return res;
      })
      .then((res) => {
        this.verifyApiResponse(res);
        return res;
      })
      .then((verifiedRes) => this.convertToTokenRows(verifiedRes))
      .then((data) => this.filterResponse(data))
      .catch(() => {
        return [];
      });

    return response;
  }
}
