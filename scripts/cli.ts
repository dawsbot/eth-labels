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
  // const cookie = `TODO_COOKIE_HERE`;
  const cookie = `_ga=GA1.2.1481160675.1654923457; _ga_XPR6BMZXSN=GS1.1.1660006001.2.1.1660006001.0; ASP.NET_SessionId=r5hgamjrrj5kbvblxjqwvvp3; __cflb=02DiuFnsSsHWYH8WqVXcJWaecAw5gpnmdw9oYjzNKyRe4; etherscan_offset_datetime=-6; _ga_T1JC9RNQXV=GS1.1.1720034616.1.1.1720034759.58.0.0; _gid=GA1.2.982027184.1720034618; cf_clearance=iKHLYXkXbaRcW0I8GmWtOKlv_.udADTzr.rI8wGdycc-1720034617-1.0.1.1-nFyzj0fie4IjtMYR9AsYl1UmskA.BZUf3OQj.i14C0c39oBOQwSCB_gL41tLW1.41HPVHeTw_xDaeMcs_vgk1w; __stripe_mid=f916037d-9db3-43d0-b392-ad02a6dfe9eea2ce17; __stripe_sid=c17d0032-7c8b-4f7f-af19-de40138d6f72f7ddc1; _gat_gtag_UA_46998878_6=1`;
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
