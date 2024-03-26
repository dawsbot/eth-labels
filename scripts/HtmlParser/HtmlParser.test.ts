import { describe, expect, test } from "vitest";
import { FileUtilities } from "../FileSystem/FileSystem";
import { BasescanHtmlParser } from "./BasescanParser";
import { EtherscanHtmlParser } from "./EtherscanParser";
import { OptimismHtmlParser } from "./OptimismHtmlParser";
const fileUtilities = new FileUtilities(import.meta.url);

const etherscanDirectory = "mocks/etherscan";
const basescanDirectory = "mocks/basescan";
const optimismDirectory = "mocks/optimism";

function getMocks(directory: string) {
  return {
    mockLabelCloudHtml: fileUtilities.readFile(`${directory}/labelcloud.html`),
    mockTokensHtml: fileUtilities.readFile(`${directory}/tokens.html`),
    mockAccountsHtml: fileUtilities.readFile(`${directory}/accounts.html`),
  };
}

const basescanMocks = getMocks(basescanDirectory);
const etherscanMocks = getMocks(etherscanDirectory);
const optimismMocks = getMocks(optimismDirectory);

describe("optimism", () => {
  const htmlParser = new OptimismHtmlParser();
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      optimismMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(101);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      optimismMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(47);
    expect(accountRows).toContainEqual({
      address: "0x76d3030728e52deb8848d5613abade88441cbc59",
      nameTag: "Aave: Wrapped Token Gateway V3",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      optimismMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(13);
    expect(tokenRows).toContainEqual({
      address: "0x00b8d5a5e1ac97cb4341c4bc4367443c8776e8d9",
      tokenName: "Synth sAAVE",
      tokenSymbol: "sAAVE",
      website: "https://synthetix.io/",
    });
  });
});
describe("basescan", () => {
  const htmlParser = new BasescanHtmlParser();
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      basescanMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(66);
    expect(allLabels[0]).toBe(`/accounts/label/aave?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      basescanMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(2);
    expect(accountRows).toContainEqual({
      address: "0x9390b1735def18560c509e2d0bc090e9d6ba257a",
      nameTag: "Aave : Executor Lvl1",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      basescanMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(3);
    expect(tokenRows).toContainEqual({
      address: "0x0a1d576f3efef75b330424287a95a366e8281d54",
      tokenName: "Aave Base USDbC",
      tokenSymbol: "aBasUSDbC",
      website: "https://aave.com/",
    });
  });
});

describe("etherscan", () => {
  const htmlParser = new EtherscanHtmlParser();
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      etherscanMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(899);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const tokenRows = htmlParser.selectAllAccountAddresses(
      etherscanMocks.mockAccountsHtml,
    );

    expect(tokenRows).toHaveLength(12);
    expect(tokenRows).toContainEqual({
      address: "0x0e8ba001a821f3ce0734763d008c9d7c957f5852",
      nameTag: "AmadeusRelay",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      etherscanMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(11);
    expect(tokenRows).toContainEqual({
      address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      tokenName: "Maker",
      tokenSymbol: "MKR",
      website: "https://makerdao.com/",
    });
  });

  test("should handle invalid HTML", () => {
    const etherscanHtmlParser = new EtherscanHtmlParser();
    const invalidHtml = "<div";
    const tokenRows = etherscanHtmlParser.selectAllTokenAddresses(invalidHtml);

    expect(tokenRows).toHaveLength(0);
    expect(Array.isArray(tokenRows)).toBe(true);

    const addressRows =
      etherscanHtmlParser.selectAllAccountAddresses(invalidHtml);
    expect(addressRows).toHaveLength(0);
    expect(Array.isArray(addressRows)).toBe(true);
  });
});
