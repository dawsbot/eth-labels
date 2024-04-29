import * as cheerio from "cheerio";
import { z } from "zod";
import type { TokenRow } from "./AnyscanPuller";

export class ApiParser {
  #baseUrl: string;
  public constructor(url: string) {
    this.#baseUrl = url;
  }
  private filterResponse(data: {
    d: {
      data: Array<{
        tokenName: string;
        tokenSymbol: string;
        tokenImage: string;
        website: string;
        contractAddress: string;
      }>;
    };
  }): Array<TokenRow> {
    data?.d?.data?.forEach(
      (token: {
        tokenName: string;
        tokenSymbol: string;
        tokenImage: string;
        website: string;
        contractAddress: string;
      }) => {
        const $1 = cheerio.load(token.tokenName);
        let title: string = $1("a > div > span").html() || "";
        let symbol: string = $1("a > div > span:nth-child(2)").html() || "";
        const tokenImage: string = $1("a > img").attr("src") || "";

        if (title?.startsWith("<span")) {
          title = title.split(" ").slice(4).join(" ");
          const regex = /"(.*?)"/g;
          const matches = title
            .match(regex)
            ?.map((match) => match.slice(1, -1));
          title = matches?.join() || ""; // Add null check and assign empty string as fallback
        }
        if (symbol?.startsWith("(<span")) {
          symbol = symbol.split(" ").slice(4).join(" ");
          const regex = /"(.*?)"/g;
          const matches = symbol
            .match(regex)
            ?.map((match) => match.slice(1, -1));
          symbol = matches?.join() || ""; // Add null check and assign empty string as fallback
        } else if (symbol?.startsWith("(")) {
          symbol = symbol.slice(1, -1);
        }
        token.tokenSymbol = symbol;
        token.tokenName = title;
        token.tokenImage = tokenImage;
        const $2 = cheerio.load(token.website);
        token.website = $2("a").attr("href") || token.website;
        // console.log(token.address)
        const $3 = cheerio.load(z.string().parse(token.contractAddress));
        token.contractAddress =
          $3("a").attr("data-bs-title") || token.contractAddress;
      },
    );
    const tokens: Array<TokenRow> = data.d.data.map((obj) => ({
      tokenImage: obj.tokenImage,
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
  ): Promise<ReadonlyArray<TokenRow>> {
    let tokens: Array<TokenRow> = [];
    await fetch(`${this.#baseUrl}/tokens.aspx/GetTokensBySubLabel`, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/json",
        priority: "u=1, i",
        cookie: cookie,
        Referer: `${this.#baseUrl}${tokenName}&subcatid=0`,
      },

      body: `{"dataTableModel":{"draw":2,"columns":[{"data":"number","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"contractAddress","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}},{"data":"tokenName","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"marketCap","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"holders","name":"","searchable":true,"orderable":true,"search":{"value":"","regex":false}},{"data":"website","name":"","searchable":true,"orderable":false,"search":{"value":"","regex":false}}],"order":[{"column":3,"dir":"desc"}],"start":0,"length":100,"search":{"value":"","regex":false}},"labelModel":{"label":"${tokenName.split("/")[3].split("?")[0]}","subCategoryId":"0"}}`,
      method: "POST",
    })
      .then((response) => response.json())
      .then(
        (data: {
          d: {
            data: Array<{
              tokenName: string;
              tokenSymbol: string;
              tokenImage: string;
              website: string;
              contractAddress: string;
              address: string;
            }>;
          };
        }) => {
          // Handle the response data here
          tokens = this.filterResponse(data) || [];
        },
      )
      .catch((error) => {
        // Handle any errors here
        console.error(`error: ${error}`);
      });
    return tokens;
  }
}

// const a: ApiParser = new ApiParser("https://polygonscan.com");
// const data: ReadonlyArray<TokenRow> = await a.fetchTokens("/tokens/label/gaming?size=100", "_ga=GA1.1.1808408089.1712093313; polygonscan_offset_datetime=-6; __stripe_mid=f4928f69-17f4-440b-88d5-f80e02b9cde9a53922; ASP.NET_SessionId=4zw35axqyd5odyu3eavjuil4; __cflb=0H28vYYxgAifymwG4Xt78Bvs2KmKYdrcyXxFGR5Umor; __stripe_sid=dc2fe3ee-565e-4ea4-ac52-9c0dc6b4258a37170b; _ga_QD3P95KD1C=GS1.1.1714418508.11.1.1714418524.0.0.0");
// console.log({data, length: data.length})

// const b: ApiParser = new ApiParser("https://ftmscan.com");
// const data2: ReadonlyArray<TokenRow> = await b.fetchTokens("/tokens/label/gaming?size=100", "_ga=GA1.1.1579536450.1712123882; ftmscan_offset_datetime=-6; __stripe_mid=66ec9764-bc58-4ee5-9311-ed6b80988692a9e64f; ASP.NET_SessionId=iqkhgscosgbml1qjjzzr1j4f; __stripe_sid=685e1bac-8623-40b7-80e3-c2c476b8463ac5c412; _ga_98XX0JLSZS=GS1.1.1714420529.2.1.1714422193.0.0.0",);
// console.log({data2, length: data2.length})
