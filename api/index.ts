import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { selectAllLabels } from "./services/select-all-labels";
import { selectMatchingLabels } from "./services/select-matching-labels";

const PORT = process.env.PORT || 3000;
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

app.get("/labels", () => {
  return selectAllLabels();
});
app.get(
  "/labels/:address",
  async ({ params }) => {
    const { address } = params;
    return selectMatchingLabels(address);
  },
  { params: t.Object({ address: t.String() }) },
);

app.get("/health", () => "OK");

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}. Open /swagger to see the API docs.`);
});
