import { describe, expect, test } from "bun:test";
import {
  expandDefiLlamaNameToKeywords,
  hasKeyword,
  isCexLabel,
  isCexNameTag,
  normalize,
  shouldWriteCexAccount,
  slugify,
} from "./cex-filter";

describe("cex-filter", () => {
  describe("normalize / slugify", () => {
    test("normalize collapses whitespace and lowercases", () => {
      expect(normalize("  Gate.IO  Hot   Wallet ")).toBe("gate.io hot wallet");
    });

    test("slugify produces hyphenated tokens", () => {
      expect(slugify("Binance CEX")).toBe("binance-cex");
      expect(slugify("Crypto.com")).toBe("crypto-com");
    });
  });

  describe("hasKeyword", () => {
    test("matches whole-word keywords with separators", () => {
      expect(hasKeyword("binance-hot-wallet", "binance")).toBe(true);
      expect(hasKeyword("hot wallet", "hot wallet")).toBe(true);
      expect(hasKeyword("gate-io", "gate")).toBe(true);
    });

    test("does not match partial words", () => {
      expect(hasKeyword("stargate", "gate")).toBe(false);
      expect(hasKeyword("sybil-delegate", "gate")).toBe(false);
      expect(hasKeyword("mev-bot", "bot")).toBe(true);
    });
  });

  describe("expandDefiLlamaNameToKeywords", () => {
    test("expands CEX protocol names into matchable keywords", () => {
      const keywords = expandDefiLlamaNameToKeywords("Binance CEX");
      expect(keywords).toContain("binance");
      expect(keywords).toContain("binance-cex");
    });

    test("drops pure stop words and very short tokens", () => {
      const keywords = expandDefiLlamaNameToKeywords("CEX");
      expect(keywords).not.toContain("cex");
      expect(keywords.every((k) => k.length >= 3)).toBe(true);
    });

    test("handles domain-style names", () => {
      const keywords = expandDefiLlamaNameToKeywords("Crypto.com");
      expect(keywords).toContain("crypto-com");
      expect(keywords).toContain("cryptocom");
    });
  });

  describe("isCexLabel", () => {
    test("matches known CEX labels", () => {
      expect(isCexLabel("binance")).toBe(true);
      expect(isCexLabel("coinbase")).toBe(true);
      expect(isCexLabel("hot-wallet")).toBe(true);
      expect(isCexLabel("bitget")).toBe(true);
      expect(isCexLabel("gate-io")).toBe(true);
    });

    test("rejects non-CEX labels", () => {
      expect(isCexLabel("mev-bot")).toBe(false);
      expect(isCexLabel("sushiswap")).toBe(false);
      expect(isCexLabel("airdrop-hunter")).toBe(false);
    });

    test("excludes hard-coded false positives", () => {
      expect(isCexLabel("biconomy")).toBe(false);
    });

    test("excludes risk / exploit labels", () => {
      expect(isCexLabel("bybit-exploit")).toBe(false);
      expect(isCexLabel("binance-hack")).toBe(false);
      expect(isCexLabel("phishing")).toBe(false);
      expect(isCexLabel("scam")).toBe(false);
      expect(isCexLabel("drainer")).toBe(false);
    });

    test("uses runtime keyword overrides", () => {
      expect(isCexLabel("robinhood", { labelKeywords: ["robinhood"] })).toBe(
        true,
      );
      expect(isCexLabel("robinhood")).toBe(false);
    });
  });

  describe("isCexNameTag", () => {
    test("returns false for null/empty", () => {
      expect(isCexNameTag(null)).toBe(false);
      expect(isCexNameTag("")).toBe(false);
    });

    test("matches CEX-ish name tags", () => {
      expect(isCexNameTag("Coinbase: Deposit Funder 12")).toBe(true);
      expect(isCexNameTag("Binance Hot Wallet")).toBe(true);
      expect(isCexNameTag("Kraken: Cold Wallet")).toBe(true);
      expect(isCexNameTag("Gate.io")).toBe(true);
    });

    test("rejects non-CEX name tags", () => {
      expect(isCexNameTag("Uniswap V3: Router")).toBe(false);
      expect(isCexNameTag("Null: 0x000...000")).toBe(false);
    });

    test("excludes hard-coded name tags", () => {
      expect(isCexNameTag("biconomy")).toBe(false);
    });
  });

  describe("shouldWriteCexAccount", () => {
    test("writes when label is CEX even without name tag", () => {
      expect(shouldWriteCexAccount("binance", null)).toBe(true);
    });

    test("writes when name tag is CEX even if label is not", () => {
      expect(shouldWriteCexAccount("loans", "Nexo: Deposit")).toBe(true);
    });

    test("skips when neither label nor name tag is CEX", () => {
      expect(shouldWriteCexAccount("mev-bot", "Flashbots Builder")).toBe(false);
    });

    test("still writes when name tag is CEX even if label is a risk term", () => {
      // Risk exclusion applies to labels only; a CEX nameTag still qualifies.
      expect(shouldWriteCexAccount("bybit-exploit", "Bybit Hot Wallet")).toBe(
        true,
      );
    });

    test("skips risk labels with no CEX name tag", () => {
      expect(shouldWriteCexAccount("bybit-exploit", null)).toBe(false);
      expect(shouldWriteCexAccount("bybit-exploit", "Random Contract")).toBe(
        false,
      );
    });
  });
});
