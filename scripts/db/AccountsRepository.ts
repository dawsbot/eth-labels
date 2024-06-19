import { db } from "./database";
import type { NewAccount } from "./types";

export async function selectAccountsByAddress(address: string) {
  return await db
    .selectFrom("accounts")
    .where("address", "=", address)
    .execute();
}

export async function createAccount(newAccount: NewAccount) {
  return await db.insertInto("accounts").values(newAccount).execute();
}

/**
 * Multi-insert accounts
 */
export async function createAccounts(newAccounts: Array<NewAccount>) {
  const MAX_ROW_INSERT_LENGTH = 1_000;
  let remainingRows = newAccounts;
  do {
    const rowsToInsert = remainingRows.slice(0, MAX_ROW_INSERT_LENGTH);
    remainingRows = remainingRows.slice(MAX_ROW_INSERT_LENGTH);
    await db
      .insertInto("accounts")
      .values(rowsToInsert)
      .onConflict((oc) =>
        oc
          .column("chainId")
          .column("address")
          .column("nameTag")
          .column("label")
          .doNothing(),
      )
      .execute();
  } while (remainingRows.length > 0);
}
