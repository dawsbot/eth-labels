import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const PORT = 3000;

new Elysia()
  .use(swagger())
  .get("/", () => "Hello Elysia")
  .get("/user/:id", ({ params: { id } }) => id)
  .listen(PORT);

console.log("Listening on port " + PORT);
