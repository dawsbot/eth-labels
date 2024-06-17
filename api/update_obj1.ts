import { readFileSync, writeFileSync } from "fs";
import path from "path";

// Function to add "label" and "chain_id" keys to each object in the JSON file
const addLabelAndChainIdToJSON = (filePath: string) => {
  // Read the JSON file synchronously
  const fileContent = readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  // Get the parent directory name (0x-protocol)
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

// Example usage
const jsonFilePath = "../data/etherscan/0x-protocol/accounts2.json";
addLabelAndChainIdToJSON(jsonFilePath);
