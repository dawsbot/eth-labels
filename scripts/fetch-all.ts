import "dotenv/config";
import type { Browser, Page } from "playwright";
import { firefox } from "playwright";
import { AnyscanPuller } from "./AnyscanPuller";
import { HtmlParser } from "./HtmlParser/HtmlParser";
import { parseError } from "./error-parse";

async function openBrowser(): Promise<{ browser: Browser; page: Page }> {
  const browser = await firefox.launch({ headless: false });
  // Create a new browser context with viewport options
  const context = await browser.newContext();

  // Create a new page
  const page = await context.newPage();
  return { browser, page };
}
function closeBrowser(browser: Browser) {
  return browser.close();
}

void (async () => {
  try {
    const { browser, page } = await openBrowser();
    const etherscanPuller = new AnyscanPuller("etherscan", new HtmlParser());
    await etherscanPuller.pullAndWriteAllAddresses(page);
    await closeBrowser(browser);
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
