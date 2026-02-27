import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import type {
  AccountSearchOptions,
  TokenSearchOptions,
} from "../scripts/db/types";
import { selectAllLabels } from "./services/select-all-labels";
import {
  selectMatchingLabels,
  selectMatchingLabelsFromQueryAccounts,
  selectMatchingLabelsFromQueryTokens,
} from "./services/select-matching-labels";

const PORT = process.env.PORT || 3000;
const CACHE_TTL = 60 * 60; // 1 hour
const cacheHeaders = {
  "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
};

export const app = new Elysia();

app.use(
  swagger({
    documentation: {
      info: {
        title: "Eth Labels API",
        version: "0.0.0",
      },
    },
  }),
);

app.get("/labels", ({ set }) => {
  set.headers = cacheHeaders;
  return selectAllLabels();
});
app.get(
  "/labels/:address",
  async ({ params, set }) => {
    set.headers = cacheHeaders;
    const { address } = params;
    return selectMatchingLabels(address);
  },
  { params: t.Object({ address: t.String() }) },
);

app.get(
  "/accounts",
  async ({ query, set }) => {
    set.headers = cacheHeaders;
    const {
      chainId,
      address,
      label,
      nameTag,
      offset,
      limit,
    }: AccountSearchOptions = query;
    const conditions: AccountSearchOptions = {
      chainId,
      address,
      label,
      nameTag,
      offset,
      limit,
    };
    return selectMatchingLabelsFromQueryAccounts(conditions);
  },
  {
    query: t.Object({
      chainId: t.Optional(t.String()),
      address: t.Optional(t.String()),
      label: t.Optional(t.String()),
      nameTag: t.Optional(t.String()),
      offset: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  },
);

app.get(
  "/tokens",
  ({ query, set }) => {
    set.headers = cacheHeaders;
    const {
      chainId,
      address,
      label,
      name,
      website,
      symbol,
      offset,
      limit,
    }: TokenSearchOptions = query;
    const conditions: TokenSearchOptions = {
      chainId,
      address,
      label,
      name,
      website,
      symbol,
      offset,
      limit,
    };
    return selectMatchingLabelsFromQueryTokens(conditions);
  },
  {
    query: t.Object({
      chainId: t.Optional(t.String()),
      address: t.Optional(t.String()),
      label: t.Optional(t.String()),
      name: t.Optional(t.String()),
      website: t.Optional(t.String()),
      symbol: t.Optional(t.String()),
      offset: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  },
);

app.get("/health", () => "OK");

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);
});
