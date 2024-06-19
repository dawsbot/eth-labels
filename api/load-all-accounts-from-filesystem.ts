import { readdirSync, readFileSync } from "fs";
import path from "path";
import type { AccountRow } from "../scripts/AnyscanPuller";

// Mapping of grandparent directory names to chain IDs
export const chainIdMapping: { [key: string]: number } = {
  etherscan: 1,
  optimism: 10,
  arbiscan: 42161,
  basescan: 8453,
  celo: 42220,
  bscscan: 56,
  gnosis: 100,
};
type AccountDBRow = {
  chainId: number;
  address: string;
  label: string;
  nameTag?: string;
};
// Function to add "label" and "chainId" keys to each object in the JSON file
const addLabelAndChainIdToJSON = (filePath: string) => {
  // Read the JSON file synchronously
  const fileContent = readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent) as Array<AccountRow>;

  // Get the parent directory name (e.g., 0x-protocol)
  const labelName = path.basename(path.dirname(filePath));

  // Get the grandparent directory name (e.g., etherscan)
  const chainName = path.basename(path.dirname(path.dirname(filePath)));

  // Determine the chainId based on the grandparent directory name
  const chainId = chainIdMapping[chainName.toLowerCase()];

  const toReturn: Array<AccountDBRow> = [];
  // Add the "label" and "chainId" keys to each object
  jsonData.forEach((obj) => {
    const newObject = {
      ...obj,
      label: labelName,
      chainId: chainId,
    };
    toReturn.push(newObject);
  });

  return toReturn;
};

// Function to recursively traverse directories and process accounts.json files
const loadDirOrFileFromFS = (dir: string) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  let combinedData: Array<AccountDBRow> = [];

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      combinedData = combinedData.concat(loadDirOrFileFromFS(fullPath));
    } else if (entry.isFile() && entry.name === "accounts.json") {
      // Process the accounts.json file and combine the data
      combinedData = combinedData.concat(addLabelAndChainIdToJSON(fullPath));
    }
  });

  return combinedData;
};

export const loadAllAccountsFromFS = () => {
  // Base directory where the data folders are located
  const baseDir = path.resolve(__dirname, "../data");

  const combinedData = loadDirOrFileFromFS(baseDir);
  return combinedData;
};
