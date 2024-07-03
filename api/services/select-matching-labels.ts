import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { AccountsRepository } from "../../scripts/db/repositories/AccountsRepository";
import { TokensRepository } from "../../scripts/db/repositories/TokensRepository";
import { EthAddress } from "../../src/domain/EthAddress";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
async function findMatchingRows(ethAddress: EthAddress) {
  const matchingRows = await Promise.all([
    TokensRepository.selectTokensByAddress(ethAddress),
    AccountsRepository.selectAccountsByAddress(ethAddress),
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
      return findMatchingRows(EthAddress.create(ensAddress));
    } catch (error) {
      console.error("Error resolving ENS address:", error);
      return { error: "Failed to resolve ENS address" };
    }
  } else {
    return findMatchingRows(EthAddress.create(address));
  }
};
