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
  #browser = undefined as unknown as BrowserHandle;
  #chain: Chain<ApiParser>;
  #cheerioParser = new CheerioParser();
  public baseUrl: string;

  private constructor(chain: Chain<ApiParser>) {
    this.#chain = chain;
    this.baseUrl = chain.website;
  }

  private async setup() {
    this.#browser = await BrowserHandle.init(this.#chain);
  }

  public static async init(chain: Chain<ApiParser>) {
    const self = new ChainPuller(chain);
    await self.setup();
    return self;
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
  
  async #pullTokenStaging(tokenUrl: string) {
    const tokenHtml = await this.#browser.fetchPageHtml(tokenUrl);
    this.#cheerioParser.loadHtml(tokenHtml);
    const navPills = this.#cheerioParser.querySelector(".nav-pills");
    let subcatUrlsToPull: Array<string> = [];
    if (navPills.length > 0) {
      const anchors = navPills.find("li > a");
      const subcatIds: Array<string> = anchors.toArray().map((anchor) => {
        const subcatId = z.string().parse(this.#cheerioParser.getAttr(anchor, "data-sub-category-id"));
        return subcatId;
      });
      for (const subcatId of subcatIds) {
        const subcatUrl = `${tokenUrl}&subcatid=${subcatId}`;
        subcatUrlsToPull = [...subcatUrlsToPull, subcatUrl];
      }
    } else {
      subcatUrlsToPull = [`${tokenUrl}&subcatid=0`];
    }
    let tokenRows: TokenRows = [];
    for (const subcatUrl of subcatUrlsToPull) {
      tokenRows = [...tokenRows, ...await this.#chain.puller.fetchTokens(subcatUrl)];
    }
    return tokenRows;
  }

  async #pullAllTokens(tokens: Array<string>) {
    for (const tokenUrl of tokens) {
      const tokenRows = await this.#pullTokenStaging(tokenUrl);
      // await this.writeTokens(tokenRows);
    }
  }

  async #pullAllAccounts(accounts: Array<string>) {
    for (const accountUrl of accounts) {
      // const accountRows = await this.#pullAccountStaging(accountUrl);
    }
  }

  public async pullAndWriteAllLabels() {
    await this.#browser.login();
    const labels = await this.#pullAllLabels();
    await this.#pullAllTokens(labels.tokens);
    await this.#pullAllAccounts(labels.accounts);
  }
}
