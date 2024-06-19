import { z } from "zod";
import type { ApiParser } from "./ApiParser/ApiParser";
import { BrowserHandle } from "./BrowserHandle";
import type { Chain } from "./Chain/Chain";
import { CheerioParser } from "./CheerioParser";
import { sleep } from "./utils/sleep";

type AllLabels = {
  accounts: Array<string>;
  tokens: Array<string>;
  blocks: ReadonlyArray<string>;
};
export type AccountRow = {
  address: string;
  nameTag: string;
};
export type TokenRow = {
  address: string;
  tokenName: string;
  tokenSymbol: string;
  website: string;
  tokenImage?: string;
};
export type AccountRows = Array<AccountRow>;
export type TokenRows = Array<TokenRow>;

export class ChainPuller {
  #browser: BrowserHandle;
  #chain: Chain<ApiParser>;
  #cheerioParser = new CheerioParser();
  public baseUrl: string;

  public constructor(chain: Chain<ApiParser>) {
    this.#chain = chain;
    this.baseUrl = chain.website;
    this.#browser = new BrowserHandle(chain);
  }

  async #pullAllLabels() {
    const labelCloudHtml = await this.#browser.fetchPageHtml(
      `${this.#chain.website}/labelcloud`,
    );
    const allAnchors = z
      .array(z.string().url().startsWith("https://"))
      .parse(
        this.#cheerioParser
          .selectAllLabels(labelCloudHtml)
          .map((anchor) => `${this.baseUrl}${anchor}`),
      );
    const allLabels: AllLabels = { accounts: [], tokens: [], blocks: [] };
    allAnchors.forEach((url) => {
      if (url.includes("/accounts/")) {
        allLabels.accounts = [...allLabels.accounts, url];
      } else if (url.includes("/tokens/")) {
        allLabels.tokens = [...allLabels.tokens, url];
      } else if (url.includes("/blocks/")) {
        allLabels.blocks = [...allLabels.blocks, url];
      } else if (url.includes("/txs/")) {
        // ignore these for now
      } else {
        throw new Error(
          `url "${url}" does not belong to "accounts", "tokens", "blocks", nor "txs"`,
        );
      }
    });
    return allLabels;
  }

  async #pullAllTokens(tokens: Array<string>) {
    for (const tokenUrl of tokens) {
      await this.#browser.navigate(tokenUrl);
      const tokenRows = await this.#chain.puller.fetchTokens(tokenUrl, "0");
      console.log(tokenRows);
    }
  }

  async #pullAllAccounts(accounts: Array<string>) {
    for (const account of accounts) {
      await sleep(1000);
    }
  }

  public async pullAndWriteAllLabels() {
    await this.#browser.init();
    await this.#browser.login();
    const labels = await this.#pullAllLabels();
    await this.#pullAllTokens(labels.tokens);
    await this.#pullAllAccounts(labels.accounts);
  }
}
