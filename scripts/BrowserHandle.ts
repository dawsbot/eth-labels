import "dotenv/config";
import type { Browser, BrowserContext, Page } from "playwright";
import type { ApiParser } from "./ApiParser/ApiParser";
import type { Chain } from "./Chain/Chain";
import { openBrowser } from "./utils/browser";

export class BrowserHandle {
  #browser: Browser;
  #page: Page;
  #baseUrl: string;
  #chain: Chain<ApiParser>;

  public constructor(chain: Chain<ApiParser>) {
    this.#chain = chain;
    this.#baseUrl = chain.website;
    this.#browser = undefined as unknown as Browser;
    this.#page = undefined as unknown as Page;
  }

  public async init() {
    const { browser, page } = await openBrowser();
    this.#browser = browser;
    this.#page = page;
  }

  public async kill() {
    return this.#browser.close();
  }

  public async login() {
    await this.#page.goto(`${this.#baseUrl}/login`);
    await this.#page.fill(
      "#ContentPlaceHolder1_txtUserName",
      process.env.ETHERSCAN_EMAIL || "",
    );
    await this.#page.fill(
      "#ContentPlaceHolder1_txtPassword",
      process.env.ETHERSCAN_PASSWORD || "",
    );
    console.log(`🐢 Waiting for operator to complete login...`);
    // TODO: Update this deprecated function to instead use "page.waitForURL" (https://playwright.dev/docs/api/class-page#page-wait-for-url)
    await this.#page.waitForURL(`${this.#baseUrl}/myaccount`, {
      timeout: 1_000 * 60 * 5,
    });

    // store log in cookie
    const context: BrowserContext = this.#page.context();
    const cookies = await context.cookies();
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    this.#chain.puller.setCookies(cookieString);

    console.log(`✅ Login completed!`);
  }

  public async fetchPageHtml(url: string): Promise<string> {
    await this.#page.goto(url);
    const content = await this.#page.content();
    return content;
  }
}
