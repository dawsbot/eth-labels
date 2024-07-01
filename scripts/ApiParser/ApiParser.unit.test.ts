import { describe, expect, test } from "bun:test";
import { FileUtilities } from "../FileSystem/FileSystem";
import type { ApiResponse } from "./ApiParser";
import { EtherscanApiParser } from "./EtherscanApiParser";
const fileUtilities = new FileUtilities(import.meta.url);

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
      name: "Aave interest bearing ENJ",
      symbol: "aENJ",
      website: "https://aave.com/atokens",
      address: "0xac6df26a590f08dcc95d5a4705ae8abbc88509ef",
      image: "/token/images/Aave_aENJ_32.png",
    });
    expect(parsedTokens).toContainEqual({
      address: "0x05ec93c0365baaeabf7aeffb0972ea7ecdd39cf1",
      image: "/token/images/Aave_aBAT_32.png",
      name: "Aave interest bearing BAT",
      symbol: "aBAT",
      website: "https://aave.com/atokens",
    });
  });
});
