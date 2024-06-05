import "dotenv/config";
import { AnyscanPuller } from "./AnyscanPuller";
import { getChainConfig } from "./cli";
import { closeBrowser, openBrowser } from "./utils/browser";
import { parseError } from "./utils/error-parse";

void (async () => {
  try {
    const chainsToPull = await getChainConfig();
    const { browser, page } = await openBrowser();
    for (const chain of chainsToPull) {
      const etherscanPuller = new AnyscanPuller(chain);
      await etherscanPuller.pullAndWriteAllAddresses(page);
    }
    await closeBrowser(browser);
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
