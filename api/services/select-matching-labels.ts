import type { Address } from "viem";
import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { AccountsRepository } from "../../scripts/db/repositories/AccountsRepository";
import { TokensRepository } from "../../scripts/db/repositories/TokensRepository";
import type {
  AccountSearchOptions,
  TokenSearchOptions,
} from "../../scripts/db/types";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
async function findMatchingRows(address: Address) {
  address = address.toLowerCase() as Address;
  const matchingRows = await Promise.all([
    TokensRepository.selectTokensByAddress(address),
    AccountsRepository.selectAccountsByAddress(address),
  ]);
  return matchingRows.flat();
}

export const selectMatchingLabels = async (address: string) => {
  if (address.includes(".")) {
    try {
      const ensAddress = await publicClient.getEnsAddress({
        name: normalize(address),
      });
      if (ensAddress === null) {
        return { error: "ENS address not found" };
      }
      return findMatchingRows(ensAddress);
    } catch (error) {
      console.error("Error resolving ENS address:", error);
      return { error: "Failed to resolve ENS address" };
    }
  } else {
    if (!isAddress(address)) {
      return { error: "Invalid address format" };
    }
    return findMatchingRows(address);
  }
};

export const selectMatchingLabelsFromQueryAccounts = (
  accounts: AccountSearchOptions,
) => {
  return AccountsRepository.selectAccountsByObj(accounts);
};

export const selectMatchingLabelsFromQueryTokens = (
  tokens: TokenSearchOptions,
) => {
  return TokensRepository.selectTokensByObj(tokens);
};
