import { readFileSync } from "fs";
import { globbySync } from "globby";
import path from "path";
import { z } from "zod";

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
const accountDBRowSchema = z.object({
  chainId: z.number(),
  address: z.string(),
  label: z.string(),
  nameTag: z.string(),
});
type AccountDBRow = z.infer<typeof accountDBRowSchema>;
// Function to add "label" and "chainId" keys to each object in the JSON file
const addLabelAndChainIdToJSON = (filePath: string) => {
  // Read the JSON file synchronously
  const fileContent = readFileSync(filePath, "utf-8");
  const anyObjectSchema = z.object({}).passthrough();
  const jsonData = z.array(anyObjectSchema).parse(JSON.parse(fileContent));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, labelName, chainName] = filePath.split("/").reverse();
  // Determine the chainId based on the grandparent directory name
  const chainId = chainIdMapping[chainName];

  const toReturn: Array<AccountDBRow> = [];
  // Add the "label" and "chainId" keys to each object
  jsonData.forEach((obj) => {
    const newObject = accountDBRowSchema.parse({
      ...obj,
      label: labelName,
      chainId: chainId,
    });
    toReturn.push(newObject);
  });

  return toReturn;
};

const generateAllAccountFilePaths = () => {
  const baseDir = path.resolve(__dirname, "../data");
  const regex = path.join(baseDir, "*/*/accounts.json");
  const allAccountFilePaths = globbySync(regex);
  return allAccountFilePaths;
};
export const loadAllAccountsFromFS = () => {
  const allAccountFilePaths = generateAllAccountFilePaths();
  const allFileContents = allAccountFilePaths.map((filePath) => {
    return addLabelAndChainIdToJSON(filePath);
  });
  return allFileContents.flat();
};
