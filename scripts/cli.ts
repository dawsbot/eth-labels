import inquirer from "inquirer";
import type { ApiParser } from "./ApiParser/ApiParser";
import type { Chain } from "./Chain/Chain";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { scanConfig } from "./scan-config";

export async function getChainConfig() {
  console.log('\n⚠️  Etherscan requires valid browser cookies to bypass Cloudflare protection.');
  console.log('📋 How to get cookies:');
  console.log('   1. Open etherscan.io in your browser');
  console.log('   2. Open DevTools (F12) → Network tab');
  console.log('   3. Refresh page and click any request');
  console.log('   4. Copy the full "Cookie:" header value');
  console.log('   5. Paste it below\n');
  
  const answer = await inquirer.prompt<{ cookie: string }>([
    {
      type: "input",
      name: "cookie",
      message: "Enter your Etherscan cookie string:",
    },
  ]);
  const cookie = answer.cookie;
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
