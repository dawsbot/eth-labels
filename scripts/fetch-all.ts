import "dotenv/config";
import { AnyscanPuller } from "./AnyscanPuller";
import { closeBrowser, openBrowser } from "./util/browser";
import { parseError } from "./util/error-parse";

void (async () => {
  try {
    const { browser, page } = await openBrowser();
    const etherscanPuller = new AnyscanPuller("etherscan");
    await etherscanPuller.pullAndWriteAllAddresses(page);
    await closeBrowser(browser);
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
