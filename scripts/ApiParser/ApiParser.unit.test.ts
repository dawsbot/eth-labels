import { describe, expect, test } from "bun:test";
import { z } from "zod";
import type { BrowserFetcher } from "../browser-fetch";
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

  test("should paginate labels with more than 100 rows", async () => {
    const paginatingApiParser = new EtherscanApiParser("https://etherscan.io");
    const aaveMock = etherscanMocks.find((mock) =>
      mock.d.data.some((d) => d.tokenName?.includes("Aave")),
    )!;
    const templateRow = aaveMock.d.data[0];

    // build synthetic rows from real fixture html, each with a unique address
    const makeRow = (index: number) => {
      const address = `0x${index.toString(16).padStart(40, "0")}`;
      return {
        ...templateRow,
        contractAddress: templateRow.contractAddress.replace(
          /0x[a-fA-F0-9]{40}/g,
          address,
        ),
      };
    };
    const buildPage = (startIndex: number, rowCount: number) =>
      JSON.stringify({
        d: {
          data: Array.from({ length: rowCount }, (_, i) =>
            makeRow(startIndex + i),
          ),
        },
      });

    const requestedStarts: Array<number> = [];
    const stubFetcher = {
      postJson: (url: string, body: string) => {
        const { start } = z
          .object({ dataTableModel: z.object({ start: z.number() }) })
          .parse(JSON.parse(body)).dataTableModel;
        requestedStarts.push(start);
        // first page is full (100 rows), second page is partial (20 rows)
        return Promise.resolve(
          start === 0 ? buildPage(0, 100) : buildPage(100, 20),
        );
      },
    } as unknown as BrowserFetcher;
    paginatingApiParser.setBrowserFetcher(stubFetcher);

    const tokens = await paginatingApiParser.fetchTokens(
      "https://etherscan.io/tokens/label/aave?size=100&start=0&subcatid=0",
    );

    // both pages were requested with an advancing "start" cursor
    expect(requestedStarts).toEqual([0, 100]);
    // all 120 rows are captured, none truncated at the 100-row page limit
    expect(tokens).toHaveLength(120);
    expect(new Set(tokens.map((token) => token.address)).size).toBe(120);
  });
});
