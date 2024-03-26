import { Browser, Page, firefox } from "playwright";
import z from "zod";
import * as cheerio from "cheerio";
import { parseError } from "./error/error-parse";
import "dotenv/config";
import fs from "fs";
import path from "path";

// scraping modules
import PullComponent from "./pull-class";
import etherscan from "./providers/etherscan";

class Main {
  private browser: any;
  private page: any;
  private isDebug: boolean;
  private providers: PullComponent[]; // Add more providers here as we develop

  constructor(args: string[]) {
    this.browser = null;
    this.page = null;
    this.isDebug =
      args.includes("--debug") || args.includes("-d") || args.includes("-D");
  }

  public async destroy() {
    await this.closeBrowser();
  }

  private log(...args: any[]): void {
    if (this.isDebug) {
      console.log(...args);
    }
  }

  public async initialize() {
    const { browser, page } = await this.openBrowser();
    this.browser = browser;
    this.page = page;
    this.providers = [];

    // ################# ADD NEW PROVIDERS HERE #################
    this.log("\n------ Adding providers ------");
    this.providers.push(new etherscan(this.browser, this.page, this.isDebug));
    this.log("------ Providers added -------");
    // ##########################################################
  }

  public async run() {
    this.log("\n------ running master pull -------");
    for (const provider of this.providers) {
      this.log(`Running provider: ${provider.name}`);
      await provider.pull();
      this.log(`Provider ${provider.name} finished\n`);
    }
    this.log("------ master pull finished ------\n");
  }

  private async openBrowser(): Promise<{ browser: any; page: any }> {
    this.log("Opening browser");
    const browser = await firefox.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    this.log("Browser opened");
    return { browser, page };
  }

  private async closeBrowser(): Promise<void> {
    this.log("Closing browser");
    await this.browser.close();
    this.log("Browser closed");
  }
}
(async () => {
  try {
    const args = process.argv.slice(2);
    const main = new Main(args);

    await main.initialize();
    await main.run();
    await main.destroy();
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
export default Main;
