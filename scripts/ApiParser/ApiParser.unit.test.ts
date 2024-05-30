import { describe, expect, test } from "vitest";
import { FileUtilities } from "../FileSystem/FileSystem";
import { EtherscanApiParser } from "./EtherscanApiParser";
const fileUtilities = new FileUtilities(import.meta.url);

type ApiResponse = {
  d: {
    data: Array<{
      tokenName: string;
      tokenSymbol: string;
      tokenImage?: string;
      website: string;
      contractAddress: string;
    }>;
  };
};

const etherscanDirectory = "mocks/etherscan";

const getMocks = (directory: string): Array<ApiResponse> => {
  const mockFiles: ReadonlyArray<string> = fileUtilities.readDir(directory);
  return mockFiles.map((file: string) => {
    const stringdata = fileUtilities.readFile(`${directory}/${file}`);
    return JSON.parse(stringdata) as ApiResponse;
  });
};

const etherscanMocks = getMocks(etherscanDirectory);

describe("EtherscanParser", () => {
  const apiParser = new EtherscanApiParser("https://etherscan.io");
  test("should parse api json", () => {
    const rawTokens = apiParser.convertToTokenRows(etherscanMocks[0]);
    const parsedTokens = apiParser.filterResponse(rawTokens);
    expect(parsedTokens[0]).toEqual({
      tokenName: "Aave interest bearing ENJ",
      tokenSymbol: "aENJ",
      website: "https://aave.com/atokens",
      address: "0xac6df26a590f08dcc95d5a4705ae8abbc88509ef",
      tokenImage: "/token/images/Aave_aENJ_32.png",
    });
    expect(parsedTokens).toContainEqual({
      address: "0x05ec93c0365baaeabf7aeffb0972ea7ecdd39cf1",
      tokenImage: "/token/images/Aave_aBAT_32.png",
      tokenName: "Aave interest bearing BAT",
      tokenSymbol: "aBAT",
      website: "https://aave.com/atokens",
    });
  });
});
