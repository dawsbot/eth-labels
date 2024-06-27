import { z } from "zod";
import type { ApiParser } from "./ApiParser/ApiParser";
import { BrowserHandle } from "./BrowserHandle";
import type { Chain } from "./Chain/Chain";
import { CheerioParser } from "./CheerioParser";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { AccountsRepository } from "./db/repositories/AccountsRepository";
import { TokensRepository } from "./db/repositories/TokensRepository";

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
  tokenName: string | null;
  tokenSymbol: string | null;
  website: string | null;
  tokenImage?: string;
};
export type AccountRows = Array<AccountRow>;
export type TokenRows = Array<TokenRow>;

/**
 * Pulls and writes everything for a given chain
 */
export class ChainPuller {
  #browser = undefined as unknown as BrowserHandle;
  #chain: Chain<ApiParser, HtmlParser>;
  #cheerioParser = new CheerioParser();
  public baseUrl: string;

  private constructor(chain: Chain<ApiParser, HtmlParser>) {
    this.#chain = chain;
    this.baseUrl = chain.website;
  }

  private async setup() {
    this.#browser = await BrowserHandle.init(this.#chain);
  }

  public static async init(chain: Chain<ApiParser, HtmlParser>) {
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
        const subcatId = z
          .string()
          .parse(this.#cheerioParser.getAttr(anchor, "data-sub-category-id"));
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
      tokenRows = [
        ...tokenRows,
        ...(await this.#chain.apiPuller.fetchTokens(subcatUrl)),
      ];
    }
    return tokenRows;
  }

  async #writeTokens(tokenRows: TokenRows, label: string) {
    for (const tokenRow of tokenRows) {
      const newToken = {
        chainId: this.#chain.chainId,
        address: tokenRow.address,
        label: label,
        name: tokenRow.tokenName,
        symbol: tokenRow.tokenSymbol,
        website: tokenRow.website,
        image: tokenRow.tokenImage,
      };
      await TokensRepository.createToken(newToken);
    }
  }

  async #pullAllTokens(tokenUrls: Array<string>) {
    // const fileUtilies = new FileUtilities(import.meta.url);
    for (const tokenUrl of tokenUrls) {
      const tokenRows = await this.#pullTokenStaging(tokenUrl);
      const label = z.string().parse(tokenUrl.split("/").pop()?.split("?")[0]);
      await this.#writeTokens(tokenRows, label);
    }
  }

  async #writeAccounts(accountRows: AccountRows, label: string) {
    for (const accountRow of accountRows) {
      const newAccount = {
        chainId: this.#chain.chainId,
        address: accountRow.address,
        label: label,
        nameTag: accountRow.nameTag,
      };
      await AccountsRepository.createAccount(newAccount);
    }
  }

  async #pullAccountStaging(accountUrl: string) {
    const accountHtml = await this.#browser.fetchPageHtml(accountUrl);
    this.#cheerioParser.loadHtml(accountHtml);
    const navPills = this.#cheerioParser.querySelector(".nav-pills");
    let accountRows: AccountRows = [];
    if (navPills.length > 0) {
      const anchors = navPills.find("li > a");
      const subcatIds: Array<string> = anchors.toArray().map((anchor) => {
        const subcatId = z
          .string()
          .parse(this.#cheerioParser.getAttr(anchor, "val"));
        return subcatId;
      });
      for (const subcatId of subcatIds) {
        const subcatAccounts = this.#chain.htmlPuller.selectAllAccountAddresses(
          accountHtml,
          subcatId,
        );
        accountRows = [...accountRows, ...subcatAccounts];
      }
    } else {
      accountRows = this.#chain.htmlPuller.selectAllAccountAddresses(
        accountHtml,
        "0",
      );
    }
    return accountRows;
  }

  async #pullAllAccounts(accounts: Array<string>) {
    for (const accountUrl of accounts) {
      const accountRows = await this.#pullAccountStaging(accountUrl);
      const label = z
        .string()
        .parse(accountUrl.split("/").pop()?.split("?")[0]);
      await this.#writeAccounts(accountRows, label);
    }
  }

  public async pullAndWriteAllLabels() {
    const labels = await this.#pullAllLabels();
    await this.#pullAllTokens(labels.tokens);
    await this.#pullAllAccounts(labels.accounts);
  }
}
