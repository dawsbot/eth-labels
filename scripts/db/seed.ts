import { loadAllAccountsFromFS } from "../../api/load-all-accounts-from-filesystem";
import { loadAlltokensFromFS } from "../../api/load-all-tokens-from-filesystem";
import { AccountsRepository } from "./repositories/AccountsRepository";
import { TokensRepository } from "./repositories/TokensRepository";

const allAccountRows = loadAllAccountsFromFS();
await AccountsRepository.createAccounts(allAccountRows);

const allTokenRows = loadAlltokensFromFS();
await TokensRepository.createTokens(allTokenRows);
