import { readFileSync } from "fs";
import { globbySync } from "globby";
import path from "path";
import { fileURLToPath } from "url";
import { isAddress } from "viem";
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
const tokenDBRowSchema = z.object({
  chainId: z.number().int().min(1),
  address: z
    .string()
    .toLowerCase()
    .refine((val) => isAddress(val), {
      message: "Invalid ethereum address found",
    }),
  label: z.string().min(2),
  tokenName: z.union([z.string(), z.null()]),
  tokenSymbol: z.union([z.string(), z.null()]),
  website: z.union([z.string().optional(), z.null()]),
  tokenImage: z.string().url().optional(),
});

type TokenDBRow = z.infer<typeof tokenDBRowSchema>;
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

  const toReturn: Array<TokenDBRow> = [];
  // Add the "label" and "chainId" keys to each object
  jsonData.forEach((obj) => {
    const newObject = {
      ...obj,
      label: labelName,
      chainId: chainId,
    };
    try {
      toReturn.push(tokenDBRowSchema.parse(newObject));
    } catch {
      console.log(
        "info: ignoring address because zod parsing failed for the following object. This is NOT a problem unless there are hundreds of these: ",
      );
      console.dir(newObject);
    }
  });

  return toReturn;
};

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const computeAllTokenFilePaths = () => {
  const baseDir = path.resolve(__dirname, "../data");
  const regex = path.join(baseDir, "*/*/tokens.json");
  const allTokenFilePaths = globbySync(regex);
  return allTokenFilePaths;
};
export const loadAlltokensFromFS = () => {
  const allTokenFilePaths = computeAllTokenFilePaths();
  const allFileContents = allTokenFilePaths.map((filePath) => {
    return addLabelAndChainIdToJSON(filePath);
  });
  return allFileContents.flat();
};
