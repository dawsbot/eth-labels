import "dotenv/config";
import inquirer from "inquirer";
import type { ApiParser } from "./ApiParser/ApiParser";
import type { Chain } from "./Chain/Chain";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { scanConfig } from "./scan-config";
import { getEtherscanCookies } from "./browser-auth";

export async function getChainConfig() {
  // Automated login - get cookies via Puppeteer
  console.log("\n🔄 Authenticating with Etherscan...\n");
  let cookie: string;
  try {
    cookie = await getEtherscanCookies();
  } catch (error) {
    console.error("\n❌ Failed to authenticate with Etherscan.");
    console.error(
      "Please ensure you have created a .env file with ETHERSCAN_USERNAME and ETHERSCAN_PASSWORD"
    );
    throw error;
  }

  const chains = scanConfig.map((chain) => ({
    name: chain.chainName,
    value: chain,
    chainId: chain.chainId,
  }));

  const selected = await inquirer.prompt<{
    chains: ReadonlyArray<Chain<ApiParser, HtmlParser>>;
  }>([
    {
      type: "checkbox",
      name: "chains",
      message: "Select chains to pull",
      choices: chains,
    },
  ]);
  return {
    chains: selected.chains,
    cookie,
  };
}
