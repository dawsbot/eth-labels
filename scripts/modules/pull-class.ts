import { Browser, Page } from "playwright";
import { parseError } from "./error/error-parse";

abstract class PullComponent {
  browser: Browser;
  page: Page;
  isDebug: boolean;

  abstract baseUrl: string;
  abstract name: string;

  constructor(browser: Browser, page: Page, isDebug: boolean) {
    this.browser = browser;
    this.page = page;
    this.isDebug = isDebug;
  }

  abstract pull(): Promise<void>;

  protected log(...args: string[]): void {
    if (this.isDebug) {
      console.log(...args);
    }
  }

  protected async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  protected async randomSleep() {
    const randomDelay = Math.random() * 600;
    await this.sleep(randomDelay + 500);
  }

  protected async fetchPageHtml(
    url: string,
    waitForSelector: string,
  ): Promise<string> {
    await this.page.goto(url);
    try {
      await this.page.waitForSelector(waitForSelector, { timeout: 10_000 });
    } catch (error) {
      if (this.isDebug) {
        parseError(error as Error);
      }
    }
    // Get the HTML content of the entire page
    const pageContent = await this.page.content();
    return pageContent;
  }
}
export default PullComponent;
