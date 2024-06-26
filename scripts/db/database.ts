import SQLite from "better-sqlite3";
import { CamelCasePlugin, Kysely, SqliteDialect } from "kysely";
import path from "path";
import { fileURLToPath } from "url";
import type { Database } from "./types"; // this is the Database interface we defined earlier
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const databasePath = path.resolve(__dirname, "db.sqlite3");
console.log(`loading in sqlite from file "${databasePath}"`);
const dialect = new SqliteDialect({
  database: new SQLite(databasePath),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin()],
});
