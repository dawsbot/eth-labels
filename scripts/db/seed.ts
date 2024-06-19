import { loadAllAccountsFromFS } from "../../api/load-all-accounts-from-filesystem";
import { AccountsRepository } from "./repositories/AccountsRepository";

const allAccountRows = loadAllAccountsFromFS();
await AccountsRepository.createAccounts(allAccountRows);
