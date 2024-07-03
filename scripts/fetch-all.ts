import "dotenv/config";
import { ChainPuller } from "./ChainPuller";
import { getChainConfig } from "./cli";
import { parseError } from "./utils/error-parse";

void (async () => {
  try {
    const config = await getChainConfig();
    const chainsToPull = config.chains;
    const cookie = `etherscan_offset_datetime=-6; __stripe_mid=e644f9aa-af06-44a3-84d4-e0bc26f1a6f88c584c; _ga_B4F580XFNY=GS1.1.1718839422.2.1.1718839428.0.0.0; _ga_9TH4H4Y7F9=GS1.1.1718839422.2.1.1718839428.0.0.0; etherscan_cookieconsent=True; ASP.NET_SessionId=vov04zgxin2utr5kxinwnl0j; __cflb=02DiuFnsSsHWYH8WqVXcJWaecAw5gpnmf6NCc5tQm9b1W; _ga=GA1.1.744885993.1717020022; cf_clearance=3LxBmrYdEnMIGNnwRuoolO9OVqbcPlCk56U4TPRQz1E-1720021490-1.0.1.1-oOLnW3TEYKLF3BPvvutEm8ourFgQ9B76S7jBDC2n4u1bXa2iCYTgryTYdeTpsLoyhCRnbvE_r9vLCLifZJ7BKw; __stripe_sid=ac3b7e3b-62ec-4b14-b0c1-eebb07c9bd784c1807; etherscan_pwd=4792:Qdxb:WV0zW+ip3GFJa19XY/l+5LcZpdxwVsRaeMGJLED3XhQ=; etherscan_userid=thistest43844; etherscan_autologin=True; _ga_T1JC9RNQXV=GS1.1.1720019720.26.1.1720021501.49.0.0`;
    console.log(cookie);

    await Promise.all(
      chainsToPull.map(async (chain) => {
        const chainPuller = await ChainPuller.init(chain, cookie);
        await chainPuller.pullAndWriteAllLabels();
      }),
    );
    process.exit(0);
  } catch (error) {
    parseError(error);
    process.exit(1);
  }
})();
