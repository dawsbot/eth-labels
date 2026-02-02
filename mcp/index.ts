#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { isAddress, JsonRpcProvider } from "essential-eth";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Data is bundled in the dist/data/ directory at build time (via prepublish script).
// Fallback: when running from source inside the repo, check ../../data/json.
const BUNDLED_DATA_DIR = join(__dirname, "data");
const REPO_DATA_DIR = join(__dirname, "..", "..", "data", "json");

import { existsSync } from "fs";
const DATA_DIR = existsSync(join(BUNDLED_DATA_DIR, "accounts.json"))
  ? BUNDLED_DATA_DIR
  : REPO_DATA_DIR;

interface Account {
  address: string;
  chainId: number;
  label: string;
  nameTag: string;
}

interface Token {
  address: string;
  chainId: number;
  label: string;
  name: string;
  symbol: string;
  website?: string;
  image?: string;
}

// Load data once at startup
function loadData(): { accounts: Array<Account>; tokens: Array<Token> } {
  const accounts: Array<Account> = JSON.parse(
    readFileSync(join(DATA_DIR, "accounts.json"), "utf-8"),
  );
  const tokens: Array<Token> = JSON.parse(
    readFileSync(join(DATA_DIR, "tokens.json"), "utf-8"),
  );
  return { accounts, tokens };
}

const { accounts, tokens } = loadData();

// Build lookup maps for fast search
const accountsByAddress = new Map<string, Array<Account>>();
for (const account of accounts) {
  const key = account.address.toLowerCase();
  if (!accountsByAddress.has(key)) {
    accountsByAddress.set(key, []);
  }
  accountsByAddress.get(key)!.push(account);
}

const tokensByAddress = new Map<string, Array<Token>>();
for (const token of tokens) {
  const key = token.address.toLowerCase();
  if (!tokensByAddress.has(key)) {
    tokensByAddress.set(key, []);
  }
  tokensByAddress.get(key)!.push(token);
}

// Build label index for search
const accountsByLabel = new Map<string, Array<Account>>();
for (const account of accounts) {
  const key = account.label.toLowerCase();
  if (!accountsByLabel.has(key)) {
    accountsByLabel.set(key, []);
  }
  accountsByLabel.get(key)!.push(account);
}

const tokensByLabel = new Map<string, Array<Token>>();
for (const token of tokens) {
  const key = token.label.toLowerCase();
  if (!tokensByLabel.has(key)) {
    tokensByLabel.set(key, []);
  }
  tokensByLabel.get(key)!.push(token);
}

// Provider for ENS resolution
const provider = new JsonRpcProvider("https://quickrpc.com/api/eth");

// Create server
const server = new McpServer({
  name: "eth-labels",
  version: "1.0.0",
});

// Tool: lookup address
server.tool(
  "lookup_address",
  "Look up a crypto address or ENS name to get its label, name tag, and associated token info. Accepts an Ethereum address (0x...) or an ENS name (e.g. vitalik.eth). When an address is provided, also attempts to resolve its ENS name.",
  {
    addressOrEns: z
      .string()
      .describe(
        "An Ethereum/EVM address (0x...) or ENS name (e.g. vitalik.eth)",
      ),
  },
  async ({ addressOrEns }) => {
    const input = addressOrEns.trim();
    let resolvedAddress: string | null = null;
    let ensName: string | null = null;

    if (isAddress(input)) {
      resolvedAddress = input;
    } else {
      // Treat as ENS name
      try {
        const address = await provider.resolveName(input);
        if (address) {
          resolvedAddress = address;
          ensName = input;
        }
      } catch {
        // ENS resolution failed
      }

      if (!resolvedAddress) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Could not resolve ENS name "${input}" to an address`,
            },
          ],
        };
      }
    }

    const normalized = resolvedAddress.toLowerCase();
    const matchedAccounts = accountsByAddress.get(normalized) || [];
    const matchedTokens = tokensByAddress.get(normalized) || [];

    const parts: Array<string> = [];

    if (ensName) {
      parts.push(`**ENS:** ${ensName}`);
    }
    parts.push(`**Address:** ${resolvedAddress}`);

    if (matchedAccounts.length === 0 && matchedTokens.length === 0) {
      parts.push("\nNo labels found in the dataset for this address.");
      return {
        content: [{ type: "text" as const, text: parts.join("\n") }],
      };
    }

    if (matchedAccounts.length > 0) {
      parts.push("\n**Accounts:**");
      for (const a of matchedAccounts) {
        parts.push(
          `- **${a.nameTag}** (label: ${a.label}, chainId: ${a.chainId})`,
        );
      }
    }

    if (matchedTokens.length > 0) {
      parts.push("\n**Tokens:**");
      for (const t of matchedTokens) {
        const details = [
          `**${t.name}** (${t.symbol})`,
          `label: ${t.label}`,
          `chainId: ${t.chainId}`,
        ];
        if (t.website) details.push(`website: ${t.website}`);
        parts.push(`- ${details.join(", ")}`);
      }
    }

    return {
      content: [{ type: "text" as const, text: parts.join("\n") }],
    };
  },
);

// Tool: search by label/name
server.tool(
  "search_labels",
  "Search for crypto addresses by label, project name, or token symbol. Returns matching accounts and tokens.",
  {
    query: z
      .string()
      .describe(
        "Search query — a project name, label, or token symbol (e.g. 'uniswap', 'binance', 'USDC')",
      ),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Maximum number of results to return (default: 20)"),
  },
  async ({ query, limit }) => {
    const q = query.toLowerCase().trim();
    const results: Array<string> = [];

    // Search accounts by label and nameTag
    for (const account of accounts) {
      if (results.length >= limit) break;
      if (
        (account.label || "").toLowerCase().includes(q) ||
        (account.nameTag || "").toLowerCase().includes(q)
      ) {
        results.push(
          `- **${account.nameTag}** — \`${account.address}\` (label: ${account.label}, chainId: ${account.chainId})`,
        );
      }
    }

    // Search tokens by label, name, and symbol
    for (const token of tokens) {
      if (results.length >= limit) break;
      if (
        (token.label || "").toLowerCase().includes(q) ||
        (token.name || "").toLowerCase().includes(q) ||
        (token.symbol || "").toLowerCase().includes(q)
      ) {
        results.push(
          `- **${token.name}** (${token.symbol}) — \`${token.address}\` (label: ${token.label}, chainId: ${token.chainId})`,
        );
      }
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No results found for "${query}"`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${results.length} result(s) for "${query}":\n\n${results.join("\n")}`,
        },
      ],
    };
  },
);

// Tool: get stats
server.tool(
  "dataset_stats",
  "Get statistics about the eth-labels dataset — total accounts, tokens, and unique labels.",
  {},
  async () => {
    const uniqueAccountLabels = new Set(accounts.map((a) => a.label));
    const uniqueTokenLabels = new Set(tokens.map((t) => t.label));
    const allLabels = new Set([...uniqueAccountLabels, ...uniqueTokenLabels]);

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `**eth-labels dataset stats:**`,
            `- Labeled accounts: ${accounts.length.toLocaleString()}`,
            `- Labeled tokens: ${tokens.length.toLocaleString()}`,
            `- Total entries: ${(accounts.length + tokens.length).toLocaleString()}`,
            `- Unique account labels: ${uniqueAccountLabels.size.toLocaleString()}`,
            `- Unique token labels: ${uniqueTokenLabels.size.toLocaleString()}`,
            `- Unique labels (combined): ${allLabels.size.toLocaleString()}`,
          ].join("\n"),
        },
      ],
    };
  },
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("eth-labels MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
