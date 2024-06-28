import { expect, test } from "bun:test";
import { scanConfig } from "../scripts/scan-config";
import {
  chainIdMapping,
  loadAllAccountsFromFS,
} from "./load-all-accounts-from-filesystem";

test("loadAllAccountsFromFS", () => {
  const allAccounts = loadAllAccountsFromFS();
  expect(allAccounts.length).toBeGreaterThan(55_200);
  expect(allAccounts).toContainEqual({
    address: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    nameTag: "0x: Exchange Proxy",
    label: "0x-protocol",
    chainId: 42161,
  });
  // assert we have all the chain ids in the mapping
  expect(Object.keys(chainIdMapping).length).toBe(scanConfig.length);
  const uniqueChainIds = Array.from(
    new Set(allAccounts.map((account) => account.chainId)),
  );
  // assert the output chain ids include all of the chain ids in the scan config
  expect(uniqueChainIds.length).toBe(scanConfig.length);
});
