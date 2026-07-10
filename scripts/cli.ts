import inquirer from "inquirer";
import type { ApiParser } from "./ApiParser/ApiParser";
import type { Chain } from "./Chain/Chain";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { scanConfig } from "./scan-config";

/**
 * Select chains to pull.
 *
 * Non-interactive: set ETH_LABELS_CHAINS to a comma-separated list of chain
 * names from scan-config (e.g. "etherscan,polygon,avalanche"), or "all".
 */
export async function getChainConfig() {
  const chains = scanConfig.map((chain) => ({
    name: chain.chainName,
    value: chain,
    chainId: chain.chainId,
  }));

  const fromEnv = process.env.ETH_LABELS_CHAINS?.trim();
  if (fromEnv) {
    if (fromEnv.toLowerCase() === "all") {
      return { chains: scanConfig };
    }
    const wanted = new Set(
      fromEnv
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
    const selected = scanConfig.filter((chain) =>
      wanted.has(chain.chainName.toLowerCase()),
    );
    const missing = [...wanted].filter(
      (name) => !scanConfig.some((c) => c.chainName.toLowerCase() === name),
    );
    if (missing.length > 0) {
      throw new Error(
        `Unknown chain name(s) in ETH_LABELS_CHAINS: ${missing.join(", ")}. ` +
          `Valid: ${scanConfig.map((c) => c.chainName).join(", ")}`,
      );
    }
    if (selected.length === 0) {
      throw new Error("ETH_LABELS_CHAINS matched no chains");
    }
    console.log(
      `Using chains from ETH_LABELS_CHAINS: ${selected
        .map((c) => c.chainName)
        .join(", ")}`,
    );
    return { chains: selected };
  }

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
  };
}
