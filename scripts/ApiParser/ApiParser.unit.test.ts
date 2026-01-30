import { describe, expect, test } from "bun:test";
import { FileUtilities } from "../FileSystem/FileSystem";
import { tokenApiResponseSchema, type TokenApiResponse } from "./ApiParser";
import { EtherscanApiParser } from "./EtherscanApiParser";
const fileUtilities = new FileUtilities(import.meta.url);

const etherscanDirectory = "mocks/etherscan";

const getMocks = (directory: string): Array<TokenApiResponse> => {
  const mockFiles: ReadonlyArray<string> = fileUtilities.readDir(directory);
  return mockFiles.map((file: string) => {
    const filePath = `${directory}/${file}`;
    const stringData = fileUtilities.readFile(filePath);
    return tokenApiResponseSchema.parse(JSON.parse(stringData));
  });
};

const etherscanMocks = getMocks(etherscanDirectory);

describe("EtherscanParser", () => {
  const apiParser = new EtherscanApiParser("https://etherscan.io");
  test("should handle tokens with no image", () => {
    const noImageMock = getMocks(etherscanDirectory).find((mock) =>
      mock.d.data.some((d) => d.tokenName?.includes("Verse Works")),
    )!;
    const rawTokens = apiParser.convertToTokenRows(noImageMock.d.data);
    const parsedTokens = apiParser.filterResponse(rawTokens);
    expect(parsedTokens[0]).toEqual({
      name: "Verse Works",
      symbol: null,
      website: null,
      address: "0xec43e92046c1527586dfaf02031622c30af9a1d6",
      image: null,
    });
  });

  test("should parse api json", () => {
    const aaveMock = etherscanMocks.find((mock) =>
      mock.d.data.some((d) => d.tokenName?.includes("Aave")),
    )!;
    const rawTokens = apiParser.convertToTokenRows(aaveMock.d.data);
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
