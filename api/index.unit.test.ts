import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { app } from ".";

const fetchLocally = async (path: string) => {
  return app
    .handle(new Request(`http://localhost:3000${path}`))
    .then((res) => res.json());
};
describe("Elysia", () => {
  it("/labels", async () => {
    const labels = z.array(z.string()).parse(await fetchLocally("/labels"));

    expect(labels.length).toBeGreaterThan(1_030);
    expect(labels).toContain("coinbase");
  });
});
