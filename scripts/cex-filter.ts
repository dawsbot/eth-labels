export const CEX_LABEL_KEYWORDS = [
  "cex",
  "exchange",
  "deposit",
  "hot-wallet",
  "cold-wallet",
  "binance",
  "coinbase",
  "kraken",
  "kucoin",
  "okx",
  "okex",
  "huobi",
  "htx",
  "bybit",
  "gate-io",
  "gateio",
  "bitfinex",
  "mexc",
  "bitget",
  "gemini",
  "bitstamp",
  "poloniex",
  "crypto-com",
  "cryptocom",
  "upbit",
  "bithumb",
  "lbank",
  "bingx",
] as const;

export const CEX_NAMETAG_KEYWORDS = [
  "cex",
  "exchange",
  "deposit",
  "hot wallet",
  "cold wallet",
  "custody",
  "custodian",
  "binance",
  "coinbase",
  "kraken",
  "kucoin",
  "okx",
  "okex",
  "huobi",
  "htx",
  "bybit",
  "gate.io",
  "bitfinex",
  "mexc",
  "bitget",
  "gemini",
  "bitstamp",
  "poloniex",
  "crypto.com",
  "upbit",
  "bithumb",
  "lbank",
  "bingx",
] as const;

export const EXCLUDED_CEX_LABELS = new Set(["biconomy"]);
export const EXCLUDED_CEX_NAMETAGS = new Set(["biconomy"]);
export const EXCLUDED_CEX_LABEL_TERMS = [
  "exploit",
  "hack",
  "phish",
  "phishing",
  "scam",
  "drainer",
  "drain",
  "attack",
  "hacker",
  "compromised",
  "suspicious",
  "fraud",
  "stolen",
] as const;

export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function hasKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalize(text);
  const normalizedKeyword = normalize(keyword);
  const keywordRegex = new RegExp(
    `(^|[^a-z0-9])${escapeRegex(normalizedKeyword)}([^a-z0-9]|$)`,
    "i",
  );
  return keywordRegex.test(normalizedText);
}

export function expandDefiLlamaNameToKeywords(name: string): Array<string> {
  const raw = normalize(name);
  const rawSlug = slugify(name);
  const noSuffix = normalize(
    raw.replace(/\b(cex|exchange|global|international|holdings|group)\b/g, " "),
  );
  const noSuffixSlug = slugify(noSuffix);
  const domainLike = normalize(raw.replace(/\./g, "-"));
  const domainLikeNoDots = normalize(raw.replace(/\./g, ""));

  const candidates = [
    raw,
    rawSlug,
    noSuffix,
    noSuffixSlug,
    domainLike,
    domainLikeNoDots,
  ];

  const stopWords = new Set([
    "cex",
    "exchange",
    "global",
    "group",
    "network",
    "protocol",
    "chain",
    "labs",
    "finance",
  ]);

  return Array.from(
    new Set(
      candidates
        .map((value) => normalize(value))
        .filter((value) => value.length >= 3 && !stopWords.has(value)),
    ),
  );
}

export type CexFilterOptions = {
  labelKeywords?: ReadonlyArray<string>;
  nameTagKeywords?: ReadonlyArray<string>;
};

export function isCexLabel(
  label: string,
  options: CexFilterOptions = {},
): boolean {
  const labelKeywords = options.labelKeywords ?? CEX_LABEL_KEYWORDS;
  const normalizedLabel = normalize(label);
  if (EXCLUDED_CEX_LABELS.has(normalizedLabel)) return false;
  if (
    EXCLUDED_CEX_LABEL_TERMS.some((term) => hasKeyword(normalizedLabel, term))
  ) {
    return false;
  }
  return labelKeywords.some((keyword) => hasKeyword(label, keyword));
}

export function isCexNameTag(
  nameTag: string | null,
  options: CexFilterOptions = {},
): boolean {
  if (!nameTag) return false;
  const nameTagKeywords = options.nameTagKeywords ?? CEX_NAMETAG_KEYWORDS;
  if (EXCLUDED_CEX_NAMETAGS.has(normalize(nameTag))) return false;
  return nameTagKeywords.some((keyword) => hasKeyword(nameTag, keyword));
}

export function shouldWriteCexAccount(
  label: string,
  nameTag: string | null,
  options: CexFilterOptions = {},
): boolean {
  return isCexNameTag(nameTag, options) || isCexLabel(label, options);
}
