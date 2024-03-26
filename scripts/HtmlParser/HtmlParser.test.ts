import { expect, test, describe } from "vitest";
import { HtmlParser } from "./HtmlParser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockLabelCloudHtml = fs.readFileSync(
  path.join(__dirname, "mocks", "etherscan", "labelcloud.html"),
  "utf8",
);
const mockTokensHtml = fs.readFileSync(
  path.join(__dirname, "mocks", "etherscan", "tokens.html"),
  "utf8",
);
const mockAccountsHtml = fs.readFileSync(
  path.join(__dirname, "mocks", "etherscan", "accounts.html"),
  "utf8",
);

describe("etherscan", () => {
  const parser = new HtmlParser();
  test("should parse labelcloud", () => {
    const baseUrl = "https://etherscan.io";
    const allLabels = parser.selectAllLabels(mockLabelCloudHtml, baseUrl);

    expect(allLabels).toHaveLength(899);
    expect(allLabels[0]).toBe(
      `${baseUrl}/accounts/label/0x-protocol?size=10000`,
    );
  });
  test("should parse account addresses", () => {
    const tokenRows = parser.selectAllAccountAddresses(mockAccountsHtml);

    expect(tokenRows).toHaveLength(12);
    expect(tokenRows).toContainEqual({
      address: "0x0e8ba001a821f3ce0734763d008c9d7c957f5852",
      nameTag: "AmadeusRelay",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = parser.selectAllTokenAddresses(mockTokensHtml);

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
