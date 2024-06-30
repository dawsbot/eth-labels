import inquirer from "inquirer";
import type { Chain } from "./Chain/Chain";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { scanConfig } from "./scan-config";

export async function getChainConfig() {
  const chains = scanConfig.map((chain) => ({
    name: chain.chainName,
    value: chain,
    chainId: chain.chainId,
  }));
  const selected = (await inquirer.prompt([
    {
      type: "checkbox",
      name: "chains",
      message: "Select chains to pull",
      choices: chains,
    },
  ])) as { chains: ReadonlyArray<Chain<HtmlParser>> };
  return selected.chains;
}
