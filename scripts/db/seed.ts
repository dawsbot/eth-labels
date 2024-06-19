import { loadAllAccountsFromFS } from "../../api/load-all-accounts-from-filesystem";
import { createAccounts } from "./AccountsRepository";

const allAccountRows = loadAllAccountsFromFS();
await createAccounts(allAccountRows.slice(0, 100));
