import { parseError } from "./error/error-parse";

abstract class PullComponent {
  browser: any;
  page: any;
  isDebug: boolean;

  abstract baseUrl: string;
  abstract name: string;

  constructor(browser: any, page: any, isDebug: boolean) {
    this.browser = browser;
    this.page = page;
    this.isDebug = isDebug;
  }

  abstract pull(): Promise<void>;

  protected log(...args: any[]): void {
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
      await this.page.waitForSelector(waitForSelector, { timeout: 15_000 });
    } catch (error: any) {
      parseError(error);
    }
    // Get the HTML content of the entire page
    const pageContent = await this.page.content();
    return pageContent;
  }
}
export default PullComponent;
