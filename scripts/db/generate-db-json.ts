import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AccountsRepository } from "./repositories/AccountsRepository";
import { TokensRepository } from "./repositories/TokensRepository";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const dataFolderPath = path.join(__dirname, "..", "..", "data");
const csvFolderPath = path.join(dataFolderPath, "csv");
const jsonFolderPath = path.join(dataFolderPath, "json");

const allTokens = await TokensRepository.selectAllTokens();
const allAccounts = await AccountsRepository.selectAllAccounts();

const tableConfig = [
  { name: "tokens", rows: allTokens },
  { name: "accounts", rows: allAccounts },
] as const;

tableConfig.forEach((table) => {
  const tableName = table.name;

  const rows = table.rows;

  if (rows.length > 0) {
    // Get column names
    const columns = Object.keys(rows[0]);

    // Prepare CSV content
    let csvContent = columns.join(",") + "\n";
    const jsonContent = rows;

    rows.forEach((row) => {
      csvContent +=
        // @ts-expect-error claude ai
        columns.map((col) => JSON.stringify(row[col])).join(",") + "\n";
    });

    const csvFilePath = path.join(csvFolderPath, `${tableName}.csv`);
    fs.writeFileSync(csvFilePath, csvContent);

    const jsonFilePath = path.join(jsonFolderPath, `${tableName}.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonContent));

    console.log(`Exported ${tableName} to CSV at "${csvFilePath}"`);
  } else {
    throw new Error(`Table ${tableName} is empty`);
  }
});

console.log("Export completed. CSV files have been created for each table.");
