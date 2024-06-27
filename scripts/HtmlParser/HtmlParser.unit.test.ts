import { describe, expect, test } from "vitest";
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
      tokenName: "Olympus",
      tokenSymbol: "OHM",
      website: "https://www.olympusdao.finance/",
    });
    // abbreviated
    expect(tokenRows).toContainEqual({
      address: "0xd91903d548f19c0fc0a6b9ed09d2f72b4dfe7144",
      tokenName: "Impossible Decentralized Incubator Access Token",
      tokenSymbol: "IDIA",
      website: "https://impossible.finance/",
    });
    // not abbreviated but tricky
    expect(tokenRows).toContainEqual({
      address: "0xe6045890b20945d00e6f3c01878265c03c5435d3",
      tokenName: "Impossible Decentralized Incubat",
      tokenSymbol: "IDIA",
      website: "https://impossible.finance/",
    });
  });
});
describe("bscscan", () => {
  const bscscanChain = new BscscanChain();
  const htmlParser = bscscanChain.htmlPuller;

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
});
describe("optimism", () => {
  const optimismChain = new OptimismChain();
  const htmlParser = optimismChain.htmlPuller;

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
});
describe("basescan", () => {
  const basescanChain = new BasescanChain();
  const htmlParser = basescanChain.htmlPuller;

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
});

describe("etherscan", () => {
  const etherscanChain = new EtherscanChain();
  const htmlParser = etherscanChain.htmlPuller;
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

  test("should handle invalid HTML", () => {
    const etherscanHtmlParser = new EtherscanHtmlParser();
    const invalidHtml = "<div";

    const addressRows =
      etherscanHtmlParser.selectAllAccountAddresses(invalidHtml);
    expect(addressRows).toHaveLength(0);
    expect(Array.isArray(addressRows)).toBe(true);
  });
});
