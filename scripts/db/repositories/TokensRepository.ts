import { db } from "../database";
import type { NewToken } from "../types";

export class TokensRepository {
  public static selectAllTokens() {
    return db
      .selectFrom("tokens")
      .select([
        "tokens.address",
        "tokens.chainId",
        "tokens.label",
        "tokens.name",
        "tokens.symbol",
        "tokens.website",
        "tokens.image",
      ])
      .execute();
  }
  public static selectTokensByLabel(label: string) {
    return db
      .selectFrom("tokens")
      .select([
        "tokens.address",
        "tokens.chainId",
        "tokens.label",
        "tokens.name",
        "tokens.symbol",
        "tokens.website",
        "tokens.image",
      ])
      .where("label", "=", label)
      .execute();
  }
  public static selectTokensByAddress(address: string) {
    return db
      .selectFrom("tokens")
      .select([
        "tokens.address",
        "tokens.chainId",
        "tokens.label",
        "tokens.name",
        "tokens.symbol",
        "tokens.website",
        "tokens.image",
      ])
      .where("address", "=", address.toLowerCase())
      .execute();
  }

  public static createToken(newToken: NewToken) {
    return db.insertInto("tokens").values(newToken).execute();
  }

  /**
   * Multi-insert tokens
   */
  public static async createTokens(newTokens: Array<NewToken>) {
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
