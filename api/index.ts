import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { loadAllAccountsFromFS } from "./load-all-accounts-from-filesystem";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const PORT = process.env.PORT || 3000;
const app = new Elysia();
const jsonData = loadAllAccountsFromFS();

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

function findMatchingRows(address: string) {
  address = address.toLowerCase();
  const matchingObjects = jsonData.filter((obj) =>
    obj.address.includes(address),
  );
  return matchingObjects;
}
app.get(
  "/labels/:address",
  async ({ params }) => {
    const { address } = params;
    if (address.includes(".")) {
      try {
        const ensAddress = await publicClient.getEnsAddress({
          name: normalize(address),
        });
        if (ensAddress === null) {
          return { error: "ENS address not found" };
        }
        return findMatchingRows(ensAddress);
      } catch (error) {
        console.error("Error resolving ENS address:", error);
        return { error: "Failed to resolve ENS address" };
      }
    } else {
      if (!isAddress(address)) {
        return { error: "Invalid address format" };
      }
      return findMatchingRows(address);
    }
  },
  { params: t.Object({ address: t.String() }) },
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);
});
