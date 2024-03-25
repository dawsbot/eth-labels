import { expect, test } from "vitest";
import { HtmlParser } from "./HtmlParser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockTokensHtml = fs.readFileSync(
  path.join(__dirname, "mocks", "tokens.html"),
  "utf8",
);

test("should parse token addresses correctly", () => {
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

test("should handle invalid HTML", () => {
  const parser = new HtmlParser();
  const invalidHtml = "<div>Invalid HTML</div>";
  const tokenRows = parser.selectAllTokenAddresses(invalidHtml);

  expect(tokenRows).toHaveLength(0);
  expect(Array.isArray(tokenRows)).toBe(true);
});
