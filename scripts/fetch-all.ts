import "dotenv/config";
import { BrowserFetcher } from "./browser-fetch";
import { ChainPuller } from "./ChainPuller";
import { getChainConfig } from "./cli";
import { parseError } from "./utils/error-parse";

void (async () => {
  const browserFetcher = new BrowserFetcher();
  try {
    console.log("\n🔗 Connecting to Chrome browser...");
    await browserFetcher.init();

    const config = await getChainConfig();
    const chainsToPull = config.chains;

    // Process chains sequentially to avoid overwhelming the browser tab
    for (const chain of chainsToPull) {
      await browserFetcher.setActiveOrigin(chain.website);
      const chainPuller = await ChainPuller.init(chain, browserFetcher);
      await chainPuller.pullAndWriteAllLabels();
    }

    console.log("\n🎉 All done!");
    process.exit(0);
  } catch (error) {
    parseError(error);
    process.exit(1);
  } finally {
    await browserFetcher.close();
  }
})();
