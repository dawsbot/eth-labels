import "dotenv/config";
import { ChainPuller } from "./ChainPuller";
import { getChainConfig } from "./cli";
import { parseError } from "./utils/error-parse";

void (async () => {
  try {
    const config = await getChainConfig();
    const chainsToPull = config.chains;

    await Promise.all(
      chainsToPull.map(async (chain) => {
        const chainPuller = await ChainPuller.init(chain, config.cookie);
        await chainPuller.pullAndWriteAllLabels();
      }),
    );
    process.exit(0);
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
