import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const PORT = 3000;

new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Eth Labels API",
          version: "0.0.0",
        },
      },
    }),
  )
  .get("/health", () => "OK")
  .get("/labels/:address", ({ params: { address } }) => {
    // TODO: return all labels here which match the inputted eth address
    // const matchingNameTags = NameTagSearcher.getMatchingNameTags(address);
    return `TODO: return all labels here which match the inputted eth address "${address}"`;
  })
  .listen(PORT);

console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);
