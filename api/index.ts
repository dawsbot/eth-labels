import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { loadAllAccountsFromFS } from "./load-all-accounts-from-filesystem";

//client docs: https://viem.sh/docs/getting-started
//name docs: https://viem.sh/docs/ens/actions/getEnsAddress.html#name
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const ensAddress = await client.getEnsAddress({
  name: normalize("wevm.eth"),
});

const PORT = 3000;
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

app.get("/labels/:address", ({ params }) => {
  const { address } = params;
  const matchingObjects = jsonData.filter((obj) =>
    obj.address.includes(address),
  );
  return matchingObjects;
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);
});
