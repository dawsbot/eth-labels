import { db } from "../database";
import type { NewToken } from "../types";

export class TokensRepository {
  private static allColumns = [
    "tokens.address",
    "tokens.chainId",
    "tokens.label",
    "tokens.name",
    "tokens.symbol",
    "tokens.website",
    "tokens.image",
  ] as const;
  public static selectAllTokens() {
    return db
      .selectFrom("tokens")
      .select(TokensRepository.allColumns)
      .orderBy("tokens.chainId asc")
      .orderBy("tokens.label asc")
      .execute();
  }
  public static selectTokensByLabel(label: string) {
    return db
      .selectFrom("tokens")
      .select(this.allColumns)
      .where("label", "=", label)
      .execute();
  }
  public static selectTokensByAddress(address: string) {
    return db
      .selectFrom("tokens")
      .select(this.allColumns)
      .where("address", "=", address.toLowerCase())
      .execute();
  }

  public static insertToken(newToken: NewToken) {
    return db.insertInto("tokens").values(newToken).execute();
  }

  /**
   * Multi-insert tokens
   */
  public static async insertTokens(newTokens: Array<NewToken>) {
    const MAX_ROW_INSERT_LENGTH = 1_000;
    let remainingRows = newTokens;
    do {
      const rowsToInsert = remainingRows.slice(0, MAX_ROW_INSERT_LENGTH);
      remainingRows = remainingRows.slice(MAX_ROW_INSERT_LENGTH);
      await db
        .insertInto("tokens")
        .values(rowsToInsert)
        .onConflict((oc) =>
          oc.column("chainId").column("address").column("label").doNothing(),
        )
        .execute();
    } while (remainingRows.length > 0);
  }
}
