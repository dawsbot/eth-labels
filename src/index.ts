import cexs from "./cex-addresses.json";
import hacks from "./hack-addresses.json";

interface CEX {
  address: string;
  nameTag: string;
}

interface HACK {
  address: string;
  balance: string;
  nameTag: string;
  txnCount: string;
}

export const CEXS: CEX[] = cexs;
export const HACKS: HACK[] = hacks;
