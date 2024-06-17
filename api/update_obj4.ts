//creates new combined file and doesn't modify original accounts.json file
import { readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";

// Function to add "label" and "chain_id" keys to each object in the JSON file
const addLabelAndChainIdToJSON = (filePath: string): any[] => {
  // Read the JSON file synchronously
  const fileContent = readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  // Get the parent directory name (e.g., 0x-protocol)
  const parentDir = path.basename(path.dirname(filePath));

  // Get the grandparent directory name (e.g., etherscan)
  const grandparentDir = path.basename(path.dirname(path.dirname(filePath)));

  // Add the "label" and "chain_id" keys to each object
  jsonData.forEach((obj: { [key: string]: any }) => {
    obj.label = parentDir;
    obj.chain_id = grandparentDir;
  });

  return jsonData;
};

// Function to recursively traverse directories and process accounts.json files
const processAccountsFiles = (dir: string): any[] => {
  const entries = readdirSync(dir, { withFileTypes: true });
  let combinedData: any[] = [];

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      combinedData = combinedData.concat(processAccountsFiles(fullPath));
    } else if (entry.isFile() && entry.name === "accounts.json") {
      // Process the accounts.json file and combine the data
      combinedData = combinedData.concat(addLabelAndChainIdToJSON(fullPath));
    }
  });

  return combinedData;
};

// Base directory where the data folders are located
const baseDir = path.resolve(__dirname, "../data");

// Process all accounts.json files and combine the data
const combinedData = processAccountsFiles(baseDir);

// Write the combined data to a new JSON file
const outputFilePath = path.resolve(
  __dirname,
  "../data/combined_accounts.json",
);
writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2), "utf-8");

console.log(`Combined data written to ${outputFilePath}`);
