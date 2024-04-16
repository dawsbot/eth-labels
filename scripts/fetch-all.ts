import "dotenv/config";
import type { Browser, Page } from "playwright";
import { firefox } from "playwright";
import { AnyscanPuller } from "./AnyscanPuller";
import runCombine from "./combine";
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

function parseTime(timerStart: number) {
  const timeTaken = Date.now() - timerStart;
  const hours = Math.floor(timeTaken / 3600000);
  const minutes = Math.floor((timeTaken % 3600000) / 60000);
  const seconds = Math.floor(((timeTaken % 360000) % 60000) / 1000);
  return { hours, minutes, seconds };
}

void (async () => {
  try {
    const timerStart = Date.now();

    const { browser, page } = await openBrowser();

    const etherscanPuller = new AnyscanPuller("etherscan");
    const basescanPuller = new AnyscanPuller("basescan");
    const optimismPuller = new AnyscanPuller("optimism");
    const arbiscanPuller = new AnyscanPuller("arbitrum");
    const cleoPuller = new AnyscanPuller("celo");

    const sourcePullers = [
      etherscanPuller,
      basescanPuller,
      optimismPuller,
      arbiscanPuller,
      cleoPuller,
    ];

    for (const puller of sourcePullers) {
      await puller.pullAndWriteAllAddresses(page);
    }
    await closeBrowser(browser);
    const { hours, minutes, seconds } = parseTime(timerStart);
    console.log(`Time elapsed: ${hours}h ${minutes}m, ${seconds}s`);
    console.log("🔀 Combining all json begin...");
    await runCombine();
    console.log("🔀 Combining all json done!");
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
