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

    expect(labels.length).toBeGreaterThan(702);
    expect(labels).toContain("coinbase");
  });

  it("/accounts", async () => {
    const coinbaseAccounts = z
      .array(z.object({ address: z.string(), nameTag: z.string() }))
      .parse(await fetchLocally("/accounts?nameTag=cOinBase%208&cHaInId=1"));

    expect(coinbaseAccounts.length).toBe(1);
    expect(coinbaseAccounts).toContainEqual({
      address: "0x02466e547bfdab679fc49e96bbfc62b9747d997c",
      nameTag: "Coinbase 8",
    });

    const accounts = z
      .array(z.object({ address: z.string(), nameTag: z.string() }))
      .parse(
        await fetchLocally(
          "/accounts?address=0x000037bb05b2Cef17c6469f4BCdb198826CE0000",
        ),
      );

    expect(accounts.length).toBe(5);
    expect(accounts).toContainEqual({
      address: "0x000037bb05b2cef17c6469f4bcdb198826ce0000",
      nameTag: "Fake_Phishing8",
    });
  });

  it("/tokens", async () => {
    const tokens = z
      .array(
        z.object({
          address: z.string(),
          label: z.string(),
          name: z.string(),
          symbol: z.string(),
        }),
      )
      .parse(
        await fetchLocally("/tokens?name=UbEsWaP&symbol=ubE"), // test case sensitivity
      );

    expect(tokens.length).toBe(3);
    expect(tokens).toContainEqual({
      address: "0x00be915b9dcf56a3cbe739d9b9c202ca692409ec",
      label: "defi",
      name: "Ubeswap",
      symbol: "UBE",
    });
  });
});
