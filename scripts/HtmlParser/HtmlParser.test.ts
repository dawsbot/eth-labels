import { describe, expect, test } from "vitest";
import { FileUtilities } from "../FileSystem/FileSystem";
import { scanConfig } from "../scan-config";
import { EtherscanHtmlParser } from "./EtherscanParser";
const fileUtilities = new FileUtilities(import.meta.url);

const etherscanDirectory = "mocks/etherscan";
const basescanDirectory = "mocks/basescan";
const optimismDirectory = "mocks/optimism";
const celoDirectory = "mocks/celo";
const ftmscanDirectory = "mocks/ftmscan";

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
const celoMocks = getMocks(celoDirectory);
const ftmMocks = getMocks(ftmscanDirectory);

describe("celo", () => {
  const htmlParser = scanConfig.celo.htmlParser;
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(celoMocks.mockLabelCloudHtml);

    expect(allLabels).toHaveLength(117);
    expect(allLabels[0]).toBe(`/accounts/label/01-node?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      celoMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(50);
    expect(accountRows).toContainEqual({
      address: "0x50cb1a8fd27159686430c4e41ecc77d2179d32c0",
      nameTag: "Fake_Phishing9",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      celoMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(22);
    expect(tokenRows).toContainEqual({
      address: "0x2cfd4b2827f35624ae12c858da969e16d5d730a2",
      tokenName: "ERC-20 TOKEN*",
      tokenSymbol: "",
      website: "",
    });
    // this html has one extra row artificially added from
    // https://celoscan.io/tokens/label/bitfinex?subcatid=0&size=50&start=0&col=3&order=desc
    expect(tokenRows).toContainEqual({
      address: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e",
      tokenName: "Tether USD",
      tokenSymbol: "USD₮",
      website: "https://tether.to/",
    });
  });
});
describe("optimism", () => {
  const htmlParser = scanConfig.optimism.htmlParser;
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
  const htmlParser = scanConfig.basescan.htmlParser;
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
  const htmlParser = scanConfig.etherscan.htmlParser;
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

describe("ftmscan", () => {
  const htmlParser = scanConfig.ftmscan.htmlParser;
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(ftmMocks.mockLabelCloudHtml);

    expect(allLabels).toHaveLength(115);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      ftmMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(52);
    expect(accountRows).toContainEqual({
      address: "0xf329e36C7bF6E5E86ce2150875a84Ce77f477375",
      nameTag: "Aave: aAAVE Token V3",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      ftmMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(31);
    expect(tokenRows).toContainEqual({
      address: "0x4a1c3ad6ed28a636ee1751c69071f6be75deb8b8",
      tokenName: "Aave Fantom Variable Debt WFTM",
      tokenSymbol: "variableDebtFanWFTM",
      tokenImage:
        "https://ftmscan.com/assets/fantom/images/svg/empty-token.svg?v=24.3.4.0",
      website: "",
    });
  });
});
