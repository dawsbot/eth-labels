import type { Browser, Page } from "playwright";
import { firefox } from "playwright";

export async function openBrowser(): Promise<{ browser: Browser; page: Page }> {
  const browser = await firefox.launch({ headless: false });
  // Create a new browser context with viewport options
  const context = await browser.newContext();

  // Create a new page
  const page = await context.newPage();
  return { browser, page };
}
export function closeBrowser(browser: Browser) {
  return browser.close();
}
