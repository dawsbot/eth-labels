// import { ApiParser } from './../ApiParser';
import "dotenv/config";
import type { Browser, Page } from "playwright";
import { describe, expect, test } from "vitest";
import { scanConfig } from "../scan-config";
import { closeBrowser, openBrowser } from "./BrowserUtil";
// import { ApiParser } from "../ApiParser";
// import type { HtmlParser } from "./HtmlParser";

describe("ApiParsing", () => {
  test("should pull exanded ftm", async () => {
    const { browser, page } = (await openBrowser()) as {
      browser: Browser;
      page: Page;
    };
    const ftmScanHtmlParser = scanConfig["ftmscan"].htmlParser;
    const baseUrl = scanConfig["ftmscan"].website;
    await ftmScanHtmlParser.login(page, baseUrl);
    const url = "https://ftmscan.com/tokens/label/yield-farming?size=100";
    await page.goto(url);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const data = await ftmScanHtmlParser.selectAllTokenAddressesApi(page, url);
    expect(data).toContainEqual({
      tokenName: "OliveCash Token",
      tokenSymbol: "fOLIVE",
      website: "https://fantom.olive.cash/",
      address: "0xa9937092c4e2b0277c16802cc8778d252854688a",
    });
    await closeBrowser(browser);
  }, 1000000);
});
