import { expect, test, describe } from "vitest";
import { HtmlParser } from "./HtmlParser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mocksDirectory = path.join(__dirname, "mocks");
const etherscanDirectory = path.join(mocksDirectory, "etherscan");
const basescanDirectory = path.join(mocksDirectory, "basescan");
const basescanMocks = {
  mockLabelCloudHtml: fs.readFileSync(
    path.join(basescanDirectory, "labelcloud.html"),
    "utf8",
  ),
};
const etherscanMocks = {
  mockLabelCloudHtml: fs.readFileSync(
    path.join(etherscanDirectory, "labelcloud.html"),
    "utf8",
  ),
  mockTokensHtml: fs.readFileSync(
    path.join(etherscanDirectory, "tokens.html"),
    "utf8",
  ),
  mockAccountsHtml: fs.readFileSync(
    path.join(etherscanDirectory, "accounts.html"),
    "utf8",
  ),
};

const parser = new HtmlParser();
describe("basescan", () => {
  test("should parse labelcloud", () => {
    const baseUrl = "https://basescan.io";
    const allLabels = parser.selectAllLabels(
      basescanMocks.mockLabelCloudHtml,
      baseUrl,
    );

    expect(allLabels).toHaveLength(66);
    expect(allLabels[0]).toBe(`${baseUrl}/accounts/label/aave?size=10000`);
  });
});
describe("etherscan", () => {
  test("should parse labelcloud", () => {
    const baseUrl = "https://etherscan.io";
    const allLabels = parser.selectAllLabels(
      etherscanMocks.mockLabelCloudHtml,
      baseUrl,
    );

    expect(allLabels).toHaveLength(899);
    expect(allLabels[0]).toBe(
      `${baseUrl}/accounts/label/0x-protocol?size=10000`,
    );
  });
  test("should parse account addresses", () => {
    const tokenRows = parser.selectAllAccountAddresses(
      etherscanMocks.mockAccountsHtml,
    );

    expect(tokenRows).toHaveLength(12);
    expect(tokenRows).toContainEqual({
      address: "0x0e8ba001a821f3ce0734763d008c9d7c957f5852",
      nameTag: "AmadeusRelay",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = parser.selectAllTokenAddresses(
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
  const parser = new HtmlParser();
  const invalidHtml = "<div";
  const tokenRows = parser.selectAllTokenAddresses(invalidHtml);

  expect(tokenRows).toHaveLength(0);
  expect(Array.isArray(tokenRows)).toBe(true);
});
