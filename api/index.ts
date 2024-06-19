import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { loadAllAccountsFromFS } from "./load-all-accounts-from-filesystem";

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

app.listen(3000, () => {
  console.log("Server is runing on http://localhost:3000");
});
console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);
