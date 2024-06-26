import inquirer from "inquirer";
import type { ApiParser } from "./ApiParser/ApiParser";
import type { Chain } from "./Chain/Chain";
import { scanConfig } from "./scan-config";

export async function getChainConfig() {
  const chains = scanConfig.map((chain) => ({
    name: chain.chainName,
    value: chain,
  }));
  const selected = (await inquirer.prompt([
    {
      type: "checkbox",
      name: "chains",
      message: "Select chains to pull",
      choices: chains,
    },
  ])) as { chains: ReadonlyArray<Chain<ApiParser>> };
  return selected.chains;
}
