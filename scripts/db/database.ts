import SQLite from "bun:sqlite";
import { CamelCasePlugin, Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import path from "path";
import { fileURLToPath } from "url";
import type { Database } from "./types"; // this is the Database interface we defined earlier
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const databasePath = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "db.sqlite3",
);
console.log(`Loading SQLite from file "${databasePath}"`);
// don't import database directly, use the "db" variable from kysely instead
export const database = new SQLite(databasePath);
const dialect = new BunSqliteDialect({
  database,
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin()],
});
