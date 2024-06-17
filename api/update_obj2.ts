//successfully updated all accounts.json files in etherscan directory
import { readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

// Function to add "label" and "chain_id" keys to each object in the JSON file
const addLabelAndChainIdToJSON = (filePath: string) => {
  // Read the JSON file synchronously
  const fileContent = readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  // Get the parent directory name
  const parentDir = path.basename(path.dirname(filePath));

  // Get the grandparent directory name (etherscan)
  const grandparentDir = path.basename(path.dirname(path.dirname(filePath)));

  // Add the "label" and "chain_id" keys to each object
  jsonData.forEach((obj: { [key: string]: any }) => {
    obj.label = parentDir;
    obj.chain_id = grandparentDir;
  });

  // Write the updated JSON back to the file synchronously
  writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
};

// Function to recursively traverse directories and process accounts.json files
const processAccountsFiles = (dir: string) => {
  const entries = readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      processAccountsFiles(fullPath);
    } else if (entry.isFile() && entry.name === "accounts.json") {
      // Process the accounts.json file
      addLabelAndChainIdToJSON(fullPath);
    }
  });
};

// Base directory where the etherscan folders are located
const baseDir = path.resolve(__dirname, "../data/etherscan");

// Start processing from the base directory
processAccountsFiles(baseDir);
