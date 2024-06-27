import "dotenv/config";
import { ChainPuller } from "./ChainPuller";
import { getChainConfig } from "./cli";
import { parseError } from "./utils/error-parse";

void (async () => {
  try {
    const chainsToPull = await getChainConfig();
    await Promise.all(
      chainsToPull.map(async (chain) => {
        const chainPuller = await ChainPuller.init(chain);
        await chainPuller.pullAndWriteAllLabels();
      }),
    );
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
