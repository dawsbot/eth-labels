import { expect, test, describe } from "vitest";
import { HtmlParser } from "./HtmlParser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockTokensHtml = fs.readFileSync(
  path.join(__dirname, "mocks", "etherscan", "tokens.html"),
  "utf8",
);
const mockAccountsHtml = fs.readFileSync(
  path.join(__dirname, "mocks", "etherscan", "accounts.html"),
  "utf8",
);

describe("etherscan", () => {
  test("should parse account addresses", () => {
    const parser = new HtmlParser();
    const tokenRows = parser.selectAllAccountAddresses(mockAccountsHtml);

    expect(tokenRows).toHaveLength(12);
    expect(tokenRows).toContainEqual({
      address: "0x0e8ba001a821f3ce0734763d008c9d7c957f5852",
      nameTag: "AmadeusRelay",
    });
  });
  test("should parse token addresses", () => {
    const parser = new HtmlParser();
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
