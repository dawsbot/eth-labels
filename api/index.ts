import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { loadAllAccountsFromFS } from "./load-all-accounts-from-filesystem";
import { loadAlltokensFromFS } from "./load-all-tokens-from-filesystem";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const PORT = 3000;
const app = new Elysia();
const accountsJsonData = loadAllAccountsFromFS();
const tokensJsonData = loadAlltokensFromFS();
const jsonData = [...accountsJsonData, ...tokensJsonData];

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
app.get("/health", () => "OK");

app.get("/labels/:address", async ({ params }) => {
  const { address } = params;
  if (address.includes(".eth")) {
    try {
      const ensAddress = await publicClient.getEnsAddress({
        name: normalize(address),
      });
      if (ensAddress === null) {
        return { error: "ENS address not found" };
      }
      const matchingObjects = jsonData.filter((obj) =>
        obj.address.includes(ensAddress),
      );
      return matchingObjects;
    } catch (error) {
      console.error("Error resolving ENS address:", error);
      return { error: "Failed to resolve ENS address" };
    }
  } else {
    const matchingObjects = jsonData.filter((obj) =>
      obj.address.includes(address),
    );
    return matchingObjects;
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);
});
