import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { AccountsRepository } from "../../scripts/db/repositories/AccountsRepository";
import { TokensRepository } from "../../scripts/db/repositories/TokensRepository";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
async function findMatchingRows(address: string) {
  address = address.toLowerCase();
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
