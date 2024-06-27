import "dotenv/config";
import { describe, expect, test } from "vitest";
import { BrowserHandle } from "../BrowserHandle";
import { EtherscanChain } from "../Chain/EtherscanChain";

describe("ApiParsing", () => {
  test("should pull exanded etherscan", async () => {
    const etherscanChain = new EtherscanChain();
    const browser = await BrowserHandle.init(etherscanChain);

    const apiPuller = etherscanChain.apiPuller;

    const url =
      "https://etherscan.io/tokens/label/aave?size=100&start=0&subcatid=1";
    await browser.navigate(url);
    const data = await apiPuller.fetchTokens(url);

    expect(data).toContainEqual({
      tokenName: "Aave interest bearing WBTC",
      tokenImage: "/token/images/Aave_aWBTC_32.png",
      tokenSymbol: "aWBTC",
      website: "https://aave.com/atokens",
      address: "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656",
    });
    await browser.kill();
  }, 1000000);
});
