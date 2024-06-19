import { db } from "./database";
import type { NewAccount } from "./types";

export async function selectAccountsByAddress(address: string) {
  return await db
    .selectFrom("accounts")
    .where("address", "=", address)
    .selectAll()
    .executeTakeFirst();
}

export async function createAccount(newAccount: NewAccount) {
  return await db
    .insertInto("accounts")
    .values(newAccount)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function createAccounts(newAccounts: Array<NewAccount>) {
  return await db
    .insertInto("accounts")
    .values(newAccounts)
    .returningAll()
    .executeTakeFirstOrThrow();
}
