import { describe, expect, test } from "vitest";
import { AccountsRepository } from "./AccountsRepository";

describe("AccountsRepository", () => {
  describe("selectAccountsByAddress", () => {
    test("null address multiple response", async () => {
      const address = "0x0000000000000000000000000000000000000000";
      const accountRows =
        await AccountsRepository.selectAccountsByAddress(address);
      expect(accountRows.length).toBeGreaterThan(7);
      expect(accountRows).toContainEqual({
        address: "0x0000000000000000000000000000000000000000",
        chainId: 1,
        id: 21452,
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
        id: 26088,
        label: "coinbase",
        nameTag: "Coinbase Cold 10",
      });
    });
  });
});
