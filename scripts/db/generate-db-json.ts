import SQLite from "bun:sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { databasePath } from "./database";

const db = new SQLite(databasePath);
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// Get all table names
const tables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'kysely%'",
  )
  .all() as Array<{ name: string }>;

tables.forEach((table) => {
  const tableName = table.name;

  // Get all rows from the table
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();

  if (rows.length > 0) {
    // Get column names
    // @ts-expect-error claude ai
    const columns = Object.keys(rows[0]);

    // Prepare CSV content
    let csvContent = columns.join(",") + "\n";

    rows.forEach((row) => {
      csvContent +=
        // @ts-expect-error claude ai
        columns.map((col) => JSON.stringify(row[col])).join(",") + "\n";
    });

    // Write to file
    fs.writeFileSync(
      path.join(__dirname, "..", "..", "data", `${tableName}.csv`),
      csvContent,
    );

    console.log(`Exported ${tableName} to CSV`);
  } else {
    console.log(`Table ${tableName} is empty`);
  }
});

db.close();

console.log("Export completed. CSV files have been created for each table.");
