import type { Address } from "viem";
import { z } from "zod";
import type { ApiParser } from "./ApiParser/ApiParser";
import type { Chain } from "./Chain/Chain";
import { CheerioParser } from "./CheerioParser";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { ProgressBar } from "./ProgressBar";
import { AccountsRepository } from "./db/repositories/AccountsRepository";
import { TokensRepository } from "./db/repositories/TokensRepository";
import { fetchHtml } from "./fetch-html";
import { sleep } from "./utils/sleep";

type AllLabels = {
  accounts: Array<string>;
  tokens: Array<string>;
  blocks: ReadonlyArray<string>;
};
export type AccountRow = {
  address: Address;
  nameTag: string | null;
};
export type TokenRow = {
  address: Address;
  name: string | null;
  symbol: string | null;
  website: string | null;
  image: string | null;
};
export type AccountRows = Array<AccountRow>;
export type TokenRows = Array<TokenRow>;

/**
 * Pulls and writes everything for a given chain
 */
export class ChainPuller {
  #chain: Chain<ApiParser, HtmlParser>;
  #cheerioParser = new CheerioParser();
  #progressBar = new ProgressBar();

  public baseUrl: string;

  private constructor(chain: Chain<ApiParser, HtmlParser>, cookie: string) {
    this.#chain = chain;
    this.baseUrl = chain.website;
    this.#chain.apiPuller.setCookies(cookie);
  }

  public static async init(
    chain: Chain<ApiParser, HtmlParser>,
    cookie: string,
  ) {
    const self = new ChainPuller(chain, cookie);
    return Promise.resolve(self);
  }

  async #pullAllLabels() {
    const labelCloudHtml = await fetchHtml(`${this.baseUrl}/labelcloud`);

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

  async #pullTokens(tokenUrl: string) {
    const tokenHtml = await fetchHtml(tokenUrl);
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
        name: tokenRow.name,
        symbol: tokenRow.symbol,
        website: tokenRow.website,
        image: tokenRow.image,
      };
      try {
        await TokensRepository.insertToken(newToken);
      } catch (e) {
        console.log("issue with token ", newToken);
        console.warn(e);
      } //duplicate or missing name. eat the error for now
    }
  }

  async #pullAllTokens(tokenUrls: Array<string>) {
    for (const tokenUrl of tokenUrls) {
      const tokenRows = await this.#pullTokens(tokenUrl);
      const label = z.string().parse(tokenUrl.split("/").pop()?.split("?")[0]);
      await this.#writeTokens(tokenRows, label);
      this.#progressBar.step();
      const randomWait = Math.floor(Math.random() * 500) + 500;
      await sleep(randomWait);
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
      try {
        await AccountsRepository.insertAccount(newAccount);
      } catch (e) {
        console.warn("issue inserting account ", newAccount);
        // console.log(e)
      }
    }
  }

  async #pullAccountStaging(accountUrl: string) {
    const accountHtml = await fetchHtml(accountUrl);
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
      const randomWait = Math.floor(Math.random() * 1000) + 300;
      await sleep(randomWait);
      const accountRows = await this.#pullAccountStaging(accountUrl);
      const label = z
        .string()
        .parse(accountUrl.split("/").pop()?.split("?")[0]);
      await this.#writeAccounts(accountRows, label);
      this.#progressBar.step();
    }
  }

  public async pullAndWriteAllLabels() {
    const labels = await this.#pullAllLabels();
    console.log(`\n🐢 Pulling tokens...`);
    this.#progressBar.start(labels.tokens.length);
    await this.#pullAllTokens(labels.tokens);
    console.log(`\n✅ Tokens completed!`);
    console.log(`\n🐢 Pulling accounts...`);
    this.#progressBar.start(labels.accounts.length);
    await this.#pullAllAccounts(labels.accounts);
    console.log(`\n✅ Accounts completed!`);
  }
}
