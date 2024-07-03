import { AccountsRepository } from "../../scripts/db/repositories/AccountsRepository";
import { TokensRepository } from "../../scripts/db/repositories/TokensRepository";

export const selectAllLabels = async (): Promise<ReadonlyArray<string>> => {
  const [allTokenLabels, allAccountLabels] = await Promise.all([
    TokensRepository.selectAllLabels(),
    AccountsRepository.selectAllLabels(),
  ]);
  const sortedLabels = allTokenLabels.concat(allAccountLabels).sort();
  // deduplicate repeats
  return Array.from(new Set(sortedLabels));
};
