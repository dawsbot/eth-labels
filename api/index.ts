import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { loadJsonFiles } from "./loadJsonFiles";

const jsonFiles = loadJsonFiles("./data");
const flattendJson = jsonFiles.flat();
const PORT = 3000;
const app = new Elysia();

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
app.post("/labels/:address", ({ params: { address } }) => {
  // TODO: return all labels here which match the inputted eth address
  // TODO: add validation for address format EG needs to be 0x...(X characters) else res.status(400)
  // const matchingNameTags = NameTagSearcher.getMatchingNameTags(address);

  return `TODO: return all labels here which match the inputted eth address "${address}"`;
});

app.post(
  "/search",
  async ({ body }) => {
    const { address } = body;
    if (!address) {
      return { error: "Address is required" };
    }

    // Search through the JSON files
    const results = flattendJson.filter((json) => {
      // Assuming each JSON object has an 'address' field
      return json.address && json.address.includes(address);
    });

    return { results };
  },
  {
    body: t.Object({
      address: t.String(),
    }),
  },
);

app.listen(PORT);

console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);

//data structure thoughts
[
  [
    [{ name: "etherscan" }],
    [[{ name: "coinbase" }], [["accounts"], ["combined"]]],
    [[{ name: "gitcoin" }], [["accounts"], ["combined"]]],
  ],
  ["arbiscan info"],
];
