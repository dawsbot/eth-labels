import type { Answers } from "inquirer";
import inquirer from "inquirer";
import { scanConfig } from "./scan-config";

type KeyOfScanConfig = keyof typeof scanConfig;

export async function getChainConfig(): Promise<
  ReadonlyArray<KeyOfScanConfig>
> {
  const chains = Object.keys(scanConfig);
  const selected = await inquirer.prompt<Answers>([
    {
      type: "checkbox",
      name: "chains",
      message: "Select chains to pull",
      choices: chains,
    },
  ]);
  return selected.chains as ReadonlyArray<KeyOfScanConfig>;
}
