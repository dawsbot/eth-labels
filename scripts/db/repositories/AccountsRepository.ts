import { db } from "../database";
import type { NewAccount } from "../types";

export class AccountsRepository {
  private static allColumns = [
    "accounts.address",
    "accounts.chainId",
    "accounts.label",
    "accounts.nameTag",
  ] as const;
  public static selectAllAccounts() {
    return db
      .selectFrom("accounts")
      .select(this.allColumns)
      .orderBy("accounts.chainId asc")
      .orderBy("accounts.label asc")
      .execute();
  }
  public static selectAccountsByLabel(label: string) {
    return db
      .selectFrom("accounts")
      .select(this.allColumns)
      .where("label", "=", label)
      .execute();
  }
  public static selectAccountsByAddress(address: string) {
    return db
      .selectFrom("accounts")
      .select(this.allColumns)
      .where("address", "=", address.toLowerCase())
      .execute();
  }

  public static createAccount(newAccount: NewAccount) {
    return db.insertInto("accounts").values(newAccount).execute();
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
