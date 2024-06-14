import type { Answers } from "inquirer";
import inquirer from "inquirer";
import type { Chain } from "./Chain/Chain";
import { scanConfig } from "./scan-config";

export async function getChainConfig(): Promise<ReadonlyArray<Chain>> {
  const chains = scanConfig.map((chain) => ({
    name: chain.chainName,
    value: chain,
  }));
  const selected = await inquirer.prompt<Answers>([
    {
      type: "checkbox",
      name: "chains",
      message: "Select chains to pull",
      choices: chains,
    },
  ]);
  return selected.chains as ReadonlyArray<Chain>;
}
