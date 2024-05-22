import { describe, expect, test } from "vitest";
import { FileUtilities } from "../FileSystem/FileSystem";
import { scanConfig } from "../scan-config";
import { EtherscanHtmlParser } from "./EtherscanParser";
const fileUtilities = new FileUtilities(import.meta.url);

const etherscanDirectory = "mocks/etherscan";
const basescanDirectory = "mocks/basescan";
const optimismDirectory = "mocks/optimism";
const celoDirectory = "mocks/celo";
const bscScanDirectory = "mocks/bscscan";
const gnosisDirectory = "mocks/gnosisscan";

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
const bscscanMocks = getMocks(bscScanDirectory);
const gnosisMocks = getMocks(gnosisDirectory);

describe("gnosis", () => {
  const htmlParser = scanConfig.gnosis.htmlParser;
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      gnosisMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(64);
    expect(allLabels[0]).toBe(`/accounts/label/aave?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      gnosisMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(2);
    expect(accountRows).toContainEqual({
      address: "0x9a1f491b86d09fc1484b5fab10041b189b60756b",
      nameTag: "Aave: Payloads Controller",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      gnosisMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(7);
    expect(tokenRows).toContainEqual({
      address: "0x7a5c3860a77a8dc1b225bd46d0fb2ac1c6d191bc",
      tokenName: "Aave Gnosis sDAI",
      tokenSymbol: "aGnosDAI",
      website: "https://aave.com/",
    });
  });
});

describe("bscscan", () => {
  const htmlParser = scanConfig.bscscan.htmlParser;
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      bscscanMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(240);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      bscscanMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(100);
    expect(accountRows).toContainEqual({
      address: "0x81dab25be86f78c30e49ae2a7e4de2dcf8036ea7",
      nameTag: "BSCswap: $US.Dollar",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      bscscanMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(100);
    // not abbreviated
    expect(tokenRows).toContainEqual({
      address: "0x9840652dc04fb9db2c43853633f0f62be6f00f98",
      tokenName: "ChainGPT",
      tokenSymbol: "CGPT",
      website: "https://www.chaingpt.org/",
    });
    // abbreviated
    // expect(tokenRows).toContainEqual({
    //   address: "0x03aa6298f1370642642415edc0db8b957783e8d6",
    //   tokenName: "NetMind Token",
    //   tokenSymbol: "NMT",
    //   website: "https://power.netmind.ai/",
    // });
  });
});
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
  test.only("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      etherscanMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(11);
    expect(tokenRows).toContainEqual({
      address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      tokenName: "Maker",
      tokenSymbol: "MKR",
      website: "https://makerdao.com/",
      tokenImage: "https://etherscan.io/token/images/mkr-etherscan-35.png"
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
