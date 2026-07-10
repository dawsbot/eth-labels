import * as cheerio from "cheerio";
import "dotenv/config";
import { z } from "zod";
import type { ApiParser } from "./ApiParser/ApiParser";
import { BrowserFetcher } from "./browser-fetch";
import {
  CEX_LABEL_KEYWORDS,
  CEX_NAMETAG_KEYWORDS,
  expandDefiLlamaNameToKeywords,
  isCexLabel as matchCexLabel,
  normalize,
  shouldWriteCexAccount,
} from "./cex-filter";
import type { Chain } from "./Chain/Chain";
import type { AccountRows } from "./ChainPuller";
import { CheerioParser } from "./CheerioParser";
import { getChainConfig } from "./cli";
import { AccountsRepository } from "./db/repositories/AccountsRepository";
import { fetchHtml } from "./fetch-html";
import type { HtmlParser } from "./HtmlParser/HtmlParser";
import { parseError } from "./utils/error-parse";
import { sleep } from "./utils/sleep";

let runtimeLabelKeywords: Array<string> = [...CEX_LABEL_KEYWORDS];
let runtimeNameTagKeywords: Array<string> = [...CEX_NAMETAG_KEYWORDS];

const DEFI_LLAMA_PROTOCOLS_URL = "https://api.llama.fi/protocols";

type DefiLlamaProtocol = {
  name?: string | null;
  category?: string | null;
};

type PullOptions = {
  no10kLimit: boolean;
  pageSize: number;
};

type AccountLabelTarget = {
  label: string;
  url: string;
  expectedCount: number;
};

const PAGE_FETCH_TIMEOUT_MS = 90_000;
const PAGE_FETCH_RETRIES = 2;

function parseOptionsFromArgs(argv: Array<string>): PullOptions {
  const hasNo10kLimit = argv.includes("--no-10k-limit");
  const pageSize = 10_000;
  return { no10kLimit: hasNo10kLimit, pageSize };
}

function filterOptions() {
  return {
    labelKeywords: runtimeLabelKeywords,
    nameTagKeywords: runtimeNameTagKeywords,
  };
}

function isCexLabel(label: string): boolean {
  return matchCexLabel(label, filterOptions());
}

async function loadDefiLlamaCexKeywords(): Promise<Array<string>> {
  try {
    const res = await fetch(DEFI_LLAMA_PROTOCOLS_URL);
    if (!res.ok) {
      console.warn(`DefiLlama fetch failed with status ${res.status}`);
      return [];
    }

    const protocols = z
      .array(
        z.object({
          name: z.string().nullable().optional(),
          category: z.string().nullable().optional(),
        }),
      )
      .parse((await res.json()) as Array<DefiLlamaProtocol>);

    const cexNames = protocols
      .filter((protocol) => normalize(protocol.category ?? "") === "cex")
      .map((protocol) => protocol.name ?? "")
      .filter((name) => name.length > 0);

    return Array.from(
      new Set(cexNames.flatMap((name) => expandDefiLlamaNameToKeywords(name))),
    );
  } catch (error) {
    console.warn(
      `DefiLlama keyword load failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
    return [];
  }
}

function urlToLabel(url: string): string {
  return z.string().parse(url.split("/").pop()?.split("?")[0]);
}

async function getAccountLabelUrls(
  chain: Chain<ApiParser, HtmlParser>,
  browserFetcher: BrowserFetcher,
  options: PullOptions,
): Promise<Array<AccountLabelTarget>> {
  const labelCloudHtml = await fetchHtml(
    `${chain.website}/labelcloud`,
    browserFetcher,
  );
  const $ = cheerio.load(labelCloudHtml);
  const allAccountLabelTargets = new Map<string, AccountLabelTarget>();

  $("a[href^='/accounts/label/']").each((_index, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    const text = normalize($(element).text());
    const countMatch = text.match(/\(([\d,]+)\)/);
    const expectedCount = countMatch
      ? Number(countMatch[1].replace(/,/g, ""))
      : 0;
    const normalizedHref = href.includes("?")
      ? href
      : `${href}?size=${options.pageSize}`;
    const url = `${chain.website}${normalizedHref}`;
    const label = urlToLabel(url);
    allAccountLabelTargets.set(url, { label, url, expectedCount });
  });

  return Array.from(allAccountLabelTargets.values()).filter((target) =>
    isCexLabel(target.label),
  );
}

function getSubCategoryIdsFromHtml(html: string): Array<string> {
  const cheerioParser = new CheerioParser();
  cheerioParser.loadHtml(html);
  const navPills = cheerioParser.querySelector(".nav-pills");
  if (navPills.length === 0) return ["0"];

  const anchors = navPills.find("li > a");
  const ids = anchors
    .toArray()
    .map((anchor) => {
      const valAttr = cheerioParser.getAttr(anchor, "val");
      const dataSubCategoryId = cheerioParser.getAttr(
        anchor,
        "data-sub-category-id",
      );
      return valAttr ?? dataSubCategoryId ?? "0";
    })
    .filter((id) => id.length > 0);

  if (ids.length === 0) return ["0"];
  return Array.from(new Set(ids));
}

function buildPagedAccountUrl(
  accountUrl: string,
  subcatId: string,
  size: number,
  start: number,
): string {
  const url = new URL(accountUrl);
  url.searchParams.set("size", `${size}`);
  url.searchParams.set("start", `${start}`);
  url.searchParams.set("subcatid", subcatId);
  return url.toString();
}

function dedupeAccountRows(rows: AccountRows): AccountRows {
  const seen = new Set<string>();
  const deduped: AccountRows = [];
  for (const row of rows) {
    const key = `${row.address.toLowerCase()}::${row.nameTag ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return deduped;
}

async function fetchHtmlWithRetry(
  url: string,
  browserFetcher: BrowserFetcher,
): Promise<string> {
  for (let attempt = 1; attempt <= PAGE_FETCH_RETRIES + 1; attempt += 1) {
    try {
      const html = await Promise.race([
        fetchHtml(url, browserFetcher),
        new Promise<never>((_resolve, reject) => {
          setTimeout(
            () => reject(new Error(`Timeout after ${PAGE_FETCH_TIMEOUT_MS}ms`)),
            PAGE_FETCH_TIMEOUT_MS,
          );
        }),
      ]);
      return html;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn(`Fetch failed (attempt ${attempt}): ${message}`);
      if (attempt <= PAGE_FETCH_RETRIES) {
        await sleep(1_000 * attempt);
      }
    }
  }

  throw new Error(`Failed to fetch after retries: ${url}`);
}

async function pullAccountRowsForUrl(
  chain: Chain<ApiParser, HtmlParser>,
  browserFetcher: BrowserFetcher,
  accountUrl: string,
  options: PullOptions,
): Promise<AccountRows> {
  const accountHtml = await fetchHtmlWithRetry(accountUrl, browserFetcher);
  const subcatIds = getSubCategoryIdsFromHtml(accountHtml);

  if (!options.no10kLimit) {
    let accountRows: AccountRows = [];
    for (const subcatId of subcatIds) {
      const subcatRows = chain.htmlPuller.selectAllAccountAddresses(
        accountHtml,
        subcatId,
      );
      accountRows = [...accountRows, ...subcatRows];
    }
    return dedupeAccountRows(accountRows);
  }

  let accountRows: AccountRows = [];
  for (const subcatId of subcatIds) {
    let start = 0;
    let hasMorePages = true;
    while (hasMorePages) {
      const pagedUrl = buildPagedAccountUrl(
        accountUrl,
        subcatId,
        options.pageSize,
        start,
      );
      const pagedHtml = await fetchHtmlWithRetry(pagedUrl, browserFetcher);
      const subcatRows = chain.htmlPuller.selectAllAccountAddresses(
        pagedHtml,
        subcatId,
      );
      accountRows = [...accountRows, ...subcatRows];

      if (subcatRows.length < options.pageSize) {
        hasMorePages = false;
      } else {
        start += options.pageSize;
      }

      // Guardrail against malformed pagination loops
      if (start > 5_000_000) {
        hasMorePages = false;
      }
    }
  }
  return dedupeAccountRows(accountRows);
}

async function writeCexAccounts(
  chainId: number,
  label: string,
  accountRows: AccountRows,
) {
  for (const row of accountRows) {
    if (!shouldWriteCexAccount(label, row.nameTag, filterOptions())) continue;

    try {
      await AccountsRepository.insertAccount({
        chainId,
        address: row.address,
        label,
        nameTag: row.nameTag,
      });
    } catch {
      // unique conflicts and transient write issues are non-fatal for pull scripts
    }
  }
}

async function pullCexForChain(
  chain: Chain<ApiParser, HtmlParser>,
  browserFetcher: BrowserFetcher,
  options: PullOptions,
) {
  console.log(`\n=== ${chain.chainName} (${chain.website}) ===`);

  const cexLabelTargets = await getAccountLabelUrls(
    chain,
    browserFetcher,
    options,
  );
  const totalExpectedRows = cexLabelTargets.reduce((sum, target) => {
    if (options.no10kLimit) return sum + target.expectedCount;
    // Default mode only pulls one page per matched label URL.
    return sum + Math.min(target.expectedCount, options.pageSize);
  }, 0);
  console.log(
    `Found ${cexLabelTargets.length} CEX-related account labels (expected rows: ${totalExpectedRows.toLocaleString()})`,
  );

  let writtenCount = 0;
  let labelsDone = 0;

  const renderProgress = () => {
    if (totalExpectedRows > 0) {
      const pct = Math.min((writtenCount / totalExpectedRows) * 100, 100);
      process.stdout.write(
        `\rProgress: ${pct.toFixed(2)}% (${writtenCount.toLocaleString()}/${totalExpectedRows.toLocaleString()})`,
      );
    } else {
      const pct = (labelsDone / cexLabelTargets.length) * 100;
      process.stdout.write(
        `\rProgress: ${pct.toFixed(2)}% (${labelsDone}/${cexLabelTargets.length} labels)`,
      );
    }
  };

  for (const target of cexLabelTargets) {
    const label = target.label;
    const accountUrl = target.url;
    const rows = await pullAccountRowsForUrl(
      chain,
      browserFetcher,
      accountUrl,
      options,
    );
    await writeCexAccounts(chain.chainId, label, rows);
    writtenCount += rows.length;
    labelsDone += 1;
    renderProgress();
    const randomWait = Math.floor(Math.random() * 800) + 300;
    await sleep(randomWait);
  }
  process.stdout.write("\n");

  console.log(
    `Done ${chain.chainName}: processed ${writtenCount} candidate rows`,
  );
}

void (async () => {
  const browserFetcher = new BrowserFetcher();
  try {
    const options = parseOptionsFromArgs(process.argv.slice(2));
    if (options.no10kLimit) {
      console.log(
        `CEX pull mode: pagination enabled (no 10k cap), page size=${options.pageSize}`,
      );
    } else {
      console.log("CEX pull mode: default (up to 10k rows per label page)");
    }

    const defiLlamaKeywords = await loadDefiLlamaCexKeywords();
    if (defiLlamaKeywords.length > 0) {
      runtimeLabelKeywords = Array.from(
        new Set([...runtimeLabelKeywords, ...defiLlamaKeywords]),
      );
      runtimeNameTagKeywords = Array.from(
        new Set([...runtimeNameTagKeywords, ...defiLlamaKeywords]),
      );
      console.log(
        `Loaded ${defiLlamaKeywords.length} CEX keywords from DefiLlama`,
      );
    } else {
      console.log("Using built-in CEX keywords (DefiLlama unavailable/empty)");
    }

    console.log("\n🔗 Connecting to Chrome browser...");
    await browserFetcher.init();

    const config = await getChainConfig();
    for (const chain of config.chains) {
      await browserFetcher.setActiveOrigin(chain.website);
      await pullCexForChain(chain, browserFetcher, options);
    }

    console.log("\n🎉 CEX pull completed!");
    process.exit(0);
  } catch (error) {
    parseError(error);
    process.exit(1);
  } finally {
    await browserFetcher.close();
  }
})();
