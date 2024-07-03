import { describe, expect, test } from "bun:test";
import { BasescanChain } from "../Chain/BasescanChain";
import { BscscanChain } from "../Chain/BscscanChain";
import { CeloChain } from "../Chain/CeloChain";
import { EtherscanChain } from "../Chain/EtherscanChain";
import { GnosisChain } from "../Chain/GnosisChain";
import { OptimismChain } from "../Chain/OptimismChain";
import { FileUtilities } from "../FileSystem/FileSystem";
import { ArbiscanChain } from "./../Chain/ArbiscanChain";
import { EtherscanHtmlParser } from "./EtherscanParser";

const fileUtilities = new FileUtilities(import.meta.url);

const etherscanDirectory = "mocks/etherscan";
const basescanDirectory = "mocks/basescan";
const optimismDirectory = "mocks/optimism";
const celoDirectory = "mocks/celo";
const bscscanDirectory = "mocks/bscscan";
const arbiscanDirectory = "mocks/arbiscan";
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
const bscscanMocks = getMocks(bscscanDirectory);
const gnosisMocks = getMocks(gnosisDirectory);
const arbiscanMocks = getMocks(arbiscanDirectory);

describe("gnosis", () => {
  const gnosisChain = new GnosisChain();
  const htmlParser = gnosisChain.htmlPuller;
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
});

describe("arbiscan", () => {
  const arbiscanChain = new ArbiscanChain();
  const htmlParser = arbiscanChain.htmlPuller;
  test("should parse labelcloud", () => {
    const allLabels = htmlParser.selectAllLabels(
      arbiscanMocks.mockLabelCloudHtml,
    );

    expect(allLabels).toHaveLength(167);
    expect(allLabels[0]).toBe(`/accounts/label/0x-protocol?size=10000`);
  });
  test("should parse account addresses", () => {
    const accountRows = htmlParser.selectAllAccountAddresses(
      arbiscanMocks.mockAccountsHtml,
    );

    expect(accountRows).toHaveLength(25);
    expect(accountRows).toContainEqual({
      address: "0x2bb52f7779fa2a77be64e199c18bd6437801caac",
      nameTag: "Aave: Pull Rewards Transfer Strategy V3",
    });
  });
  test("should parse token addresses", () => {
    const tokenRows = htmlParser.selectAllTokenAddresses(
      arbiscanMocks.mockTokensHtml,
    );

    expect(tokenRows).toHaveLength(43);
    // not abbreviated
    expect(tokenRows).toContainEqual({
      address: "0xf0cb2dc0db5e6c66B9a70Ac27B06b878da017028",
      name: "Olympus",
      symbol: "OHM",
      website: "https://www.olympusdao.finance/",
      image: null,
    });
    // abbreviated
    expect(tokenRows).toContainEqual({
      address: "0xd91903d548f19c0fc0a6b9ed09d2f72b4dfe7144",
      name: "Impossible Decentralized Incubator Access Token",
      symbol: "IDIA",
      website: "https://impossible.finance/",
      image: null,
    });
    // not abbreviated but tricky
    expect(tokenRows).toContainEqual({
      address: "0xe6045890b20945d00e6f3c01878265c03c5435d3",
      name: "Impossible Decentralized Incubat",
      symbol: "IDIA",
      website: "https://impossible.finance/",
      image: null,
    });
  });
});
describe("bscscan", () => {
  const bscscanChain = new BscscanChain();
  const htmlParser = bscscanChain.htmlPuller;
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
      name: "ChainGPT",
      symbol: "CGPT",
      website: "https://www.chaingpt.org/",
      image: null,
    });
    // abbreviated
    // expect(tokenRows).toContainEqual({
    //   address: "0x03aa6298f1370642642415edc0db8b957783e8d6",
    //   name: "NetMind Token",
    //   symbol: "NMT",
    //   website: "https://power.netmind.ai/",
    // });
  });
});
describe("celo", () => {
  const celoChain = new CeloChain();
  const htmlParser = celoChain.htmlPuller;
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
      name: "ERC-20 TOKEN*",
      symbol: "",
      website: "",
      image: null,
    });
    // this html has one extra row artificially added from
    // https://celoscan.io/tokens/label/bitfinex?subcatid=0&size=50&start=0&col=3&order=desc
    expect(tokenRows).toContainEqual({
      address: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e",
      name: "Tether USD",
      symbol: "USD₮",
      website: "https://tether.to/",
      image: null,
    });
  });
});
describe("optimism", () => {
  const optimismChain = new OptimismChain();
  const htmlParser = optimismChain.htmlPuller;
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
      name: "Synth sAAVE",
      symbol: "sAAVE",
      website: "https://synthetix.io/",
      image: null,
    });
  });
});
describe("basescan", () => {
  const basescanChain = new BasescanChain();
  const htmlParser = basescanChain.htmlPuller;
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
      name: "Aave Base USDbC",
      symbol: "aBasUSDbC",
      website: "https://aave.com/",
      image: null,
    });
  });
});

describe("etherscan", () => {
  const etherscanChain = new EtherscanChain();
  const htmlParser = etherscanChain.htmlPuller;
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
      name: "Maker",
      symbol: "MKR",
      website: "https://makerdao.com/",
      image: "/token/images/mkr-etherscan-35.png",
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
