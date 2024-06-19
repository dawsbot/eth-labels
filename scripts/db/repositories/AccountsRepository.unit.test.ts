import { describe, expect, test } from "vitest";
import { AccountsRepository } from "./AccountsRepository";

describe("AccountsRepository", () => {
  test("selectAllAccounts", async () => {
    const accountRows = await AccountsRepository.selectAllAccounts();
    expect(accountRows.length).toBe(55_231);
    expect(accountRows).toContainEqual({
      chainId: 1,
      address: "0x4f86d1d365434bfbc1e818534d353ffc1a06f8fe",
      label: "coinbase",
      nameTag: "Coinbase: Deposit Funder 12",
    });
  });
  test("selectAccountsByLabel", async () => {
    const label = "coinbase";
    const accountRows = await AccountsRepository.selectAccountsByLabel(label);
    expect(accountRows.length).toBeGreaterThan(130);
    expect(accountRows.length).toBeLessThan(150);
    expect(accountRows).toContainEqual({
      chainId: 1,
      address: "0x4f86d1d365434bfbc1e818534d353ffc1a06f8fe",
      label: "coinbase",
      nameTag: "Coinbase: Deposit Funder 12",
    });
  });

  describe("selectAccountsByAddress", () => {
    test("null address multiple response", async () => {
      const address = "0x0000000000000000000000000000000000000000";
      const accountRows =
        await AccountsRepository.selectAccountsByAddress(address);
      expect(accountRows.length).toBeGreaterThan(7);
      expect(accountRows).toContainEqual({
        address: "0x0000000000000000000000000000000000000000",
        chainId: 1,
        label: "blocked",
        nameTag: "Null: 0x000...000",
      });
    });
    test("one coinbase address on arbiscan", async () => {
      const address = "0xb8487eed31cf5c559bf3f4edd166b949553d0d11";
      const accountRows = await AccountsRepository.selectAccountsByAddress(
        address.toUpperCase(), // ensures we ignore casing in search
      );
      expect(accountRows.length).toBe(1);
      expect(accountRows).toContainEqual({
        address: "0xb8487eed31cf5c559bf3f4edd166b949553d0d11",
        chainId: 1,
        label: "coinbase",
        nameTag: "Coinbase Cold 10",
      });
    });
  });
});
