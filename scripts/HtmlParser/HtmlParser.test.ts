import { describe, expect, test } from "vitest";
import { FileUtilities } from "../FileSystem/FileSystem";
import { scanConfig } from "../scan-config";
const fileUtilities = new FileUtilities(import.meta.url);

const etherscanDirectory = "mocks/etherscan";
const basescanDirectory = "mocks/basescan";
const optimismDirectory = "mocks/optimism";
const celoDirectory = "mocks/celo";
const arbiscanDirectory = "mocks/arbiscan";
const polygonDirectory = "mocks/polygon";
const bscscanDirectory = "mocks/bscscan";
const gnosisDirectory = "mocks/gnosisscan";
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
const arbiscanMocks = getMocks(arbiscanDirectory);
const polygonMocks = getMocks(polygonDirectory);
const bscscanMocks = getMocks(bscscanDirectory);
const gnosisMocks = getMocks(gnosisDirectory);
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
      address: "0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8",
      tokenName: "Aave Fantom ...",
      tokenSymbol: "variab...",
      website: "",
    });
  });
});

describe("gnosis", () => {
  const htmlParser = scanConfig.gnosisscan.htmlParser;
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

    expect(allLabels).toHaveLength(236);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      bscscanMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(42);
    expect(accountRows).toContainEqual({
      address: "0x4A9A2b2b04549C3927dd2c9668A5eF3fCA473623",
      nameTag: "dForce: DF Token",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      bscscanMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(66);
    expect(tokenRows).toContainEqual({
      address: "0x80D5f92C2c8C682070C95495313dDB680B267320",
      tokenName: "Binance-Peg ...",
      tokenSymbol: "ASR",
      website: "https://www.chiliz.com",
    });
  });
});

describe("polygon", () => {
  const htmlParser = scanConfig.polygonscan.htmlParser;
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      polygonMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(232);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      polygonMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(105);
    expect(accountRows).toContainEqual({
      address: "0xe590cfca10e81FeD9B0e4496381f02256f5d2f61",
      nameTag: "Aave: amUSDT Stable Debt V2",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      polygonMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(18);
    expect(tokenRows).toContainEqual({
      address: "0xA4D94019934D8333Ef880ABFFbF2FDd611C762BD",
      tokenName: "Aave Polygon...",
      tokenSymbol: "aPolUS...",
      website: "https://aave.com/",
    });
  });
});

describe("arbiscan", () => {
  const htmlParser = scanConfig.arbitrum.htmlParser;
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      arbiscanMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(159);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      arbiscanMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(48);
    expect(accountRows).toContainEqual({
      address: "0xb56c2f0b653b2e0b10c9b928c8580ac5df02c7c7",
      nameTag: "Aave: Aave Oracle V3",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      arbiscanMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(13);
    expect(tokenRows).toContainEqual({
      address: "0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee",
      tokenName: "Aave Arbitrum DAI",
      tokenSymbol: "aArbDAI",
      website: "https://aave.com/",
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
    const etherscanHtmlParser = scanConfig.etherscan.htmlParser;
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
