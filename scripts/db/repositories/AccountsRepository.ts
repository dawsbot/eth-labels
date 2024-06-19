import { db } from "../database";
import type { NewAccount } from "../types";

export class AccountsRepository {
  public static async selectAccountsByAddress(address: string) {
    return await db
      .selectFrom("accounts")
      .selectAll()
      .where("address", "=", address.toLowerCase())
      .executeTakeFirst();
  }

  public static async createAccount(newAccount: NewAccount) {
    return await db.insertInto("accounts").values(newAccount).execute();
  }

  /**
   * Multi-insert accounts
   */
  public static async createAccounts(newAccounts: Array<NewAccount>) {
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
}
