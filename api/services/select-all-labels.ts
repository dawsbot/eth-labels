import { AccountsRepository } from "../../scripts/db/repositories/AccountsRepository";
import { TokensRepository } from "../../scripts/db/repositories/TokensRepository";

export const selectAllLabels = async (): Promise<ReadonlyArray<string>> => {
  const [allTokenLabels, allAccountLabels] = await Promise.all([
    TokensRepository.selectAllLabels(),
    AccountsRepository.selectAllLabels(),
  ]);
  return allTokenLabels.concat(allAccountLabels);
};
