import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

// Mapping of grandparent directory names to chain IDs
const chainIdMapping: { [key: string]: number } = {
  etherscan: 1,
  arbiscan: 42161,
  basescan: 8453,
  bscscan: 56,
  celo: 42220,
  gnosis: 100,
  optimism: 10,
};

// Function to add "label" and "chainId" keys to each object in the JSON file
const addLabelAndChainIdToJSON = (filePath: string): any[] => {
  // Read the JSON file synchronously
  const fileContent = readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  // Get the parent directory name (e.g., 0x-protocol)
  const parentDir = path.basename(path.dirname(filePath));

  // Get the grandparent directory name (e.g., etherscan)
  const grandparentDir = path.basename(path.dirname(path.dirname(filePath)));

  // Determine the chainId based on the grandparent directory name
  const chainId = chainIdMapping[grandparentDir.toLowerCase()] || null;

  // Add the "label" and "chainId" keys to each object
  jsonData.forEach((obj: { [key: string]: any }) => {
    obj.label = parentDir;
    obj.chainId = chainId;
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
