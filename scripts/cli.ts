import inquirer from "inquirer";
import type { ApiParser } from "./ApiParser/ApiParser";
import type { Chain } from "./Chain/Chain";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { scanConfig } from "./scan-config";

export async function getChainConfig() {
  // const answer = await inquirer.prompt<{ cookie: string }>([
  //   {
  //     type: "input",
  //     name: "cookie",
  //     message: "enter your chain cookie",
  //   },
  // ]);
  // const cookie = answer.cookie;
  const cookie = `TODO_COOKIE_HERE`;
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
