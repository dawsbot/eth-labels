import { describe, expect, test } from "vitest";
import { FileUtilities } from "../FileSystem/FileSystem";
import { BasescanParser } from "./BasescanParser";
import { EtherscanParser } from "./EtherscanParser";
const fileUtilities = new FileUtilities(import.meta.url);

const etherscanDirectory = "mocks/etherscan";
const basescanDirectory = "mocks/basescan";
const basescanMocks = {
  mockLabelCloudHtml: fileUtilities.readFile(
    `${basescanDirectory}/labelcloud.html`,
  ),
  mockAccountsHtml: fileUtilities.readFile(
    `${basescanDirectory}/accounts.html`,
  ),
  mockTokensHtml: fileUtilities.readFile(`${basescanDirectory}/tokens.html`),
};
const etherscanMocks = {
  mockLabelCloudHtml: fileUtilities.readFile(
    `${etherscanDirectory}/labelcloud.html`,
  ),
  mockTokensHtml: fileUtilities.readFile(`${etherscanDirectory}/tokens.html`),
  mockAccountsHtml: fileUtilities.readFile(
    `${etherscanDirectory}/accounts.html`,
  ),
};

describe("basescan", () => {
  const basescanParser = new BasescanParser();
  test("should parse labelcloud", () => {
    const baseUrl = "https://basescan.io";
    const allLabels = basescanParser.selectAllLabels(
      basescanMocks.mockLabelCloudHtml,
      baseUrl,
    );

    expect(allLabels).toHaveLength(66);
    expect(allLabels[0]).toBe(`${baseUrl}/accounts/label/aave?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = basescanParser.selectAllAccountAddresses(
      basescanMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(2);
  });
  test("should parse token addresses", () => {
    const tokenRows = basescanParser.selectAllTokenAddresses(
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
  const etherscanHtmlParser = new EtherscanParser();
  test("should parse labelcloud", () => {
    const baseUrl = "https://etherscan.io";
    const allLabels = etherscanHtmlParser.selectAllLabels(
      etherscanMocks.mockLabelCloudHtml,
      baseUrl,
    );

    expect(allLabels).toHaveLength(899);
    expect(allLabels[0]).toBe(
      `${baseUrl}/accounts/label/0x-protocol?size=10000`,
    );
  });
  test("should parse account addresses", () => {
    const tokenRows = etherscanHtmlParser.selectAllAccountAddresses(
      etherscanMocks.mockAccountsHtml,
    );

    expect(tokenRows).toHaveLength(12);
    expect(tokenRows).toContainEqual({
      address: "0x0e8ba001a821f3ce0734763d008c9d7c957f5852",
      nameTag: "AmadeusRelay",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = etherscanHtmlParser.selectAllTokenAddresses(
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
});

test("should handle invalid HTML", () => {
  const etherscanHtmlParser = new EtherscanParser();
  const invalidHtml = "<div";
  const tokenRows = etherscanHtmlParser.selectAllTokenAddresses(invalidHtml);

  expect(tokenRows).toHaveLength(0);
  expect(Array.isArray(tokenRows)).toBe(true);
});
