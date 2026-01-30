import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { z } from "zod";

/**
 * BrowserFetcher - Makes HTTP requests through a real Chrome browser via CDP.
 *
 * Cloudflare blocks all out-of-browser requests (Node.js fetch, curl, etc.)
 * because it fingerprints TLS handshakes (JA3/JA4). The only way to make
 * requests to Cloudflare-protected endpoints is through a real browser.
 *
 * This class connects to an already-running Chrome instance (e.g. Clawdbot's
 * managed browser at port 18800) and uses page.evaluate(fetch(...)) to make
 * requests from within the browser context.
 */
export class BrowserFetcher {
  #browser: Browser | null = null;
  #page: Page | null = null;
  #ready = false;

  /**
   * Connect to a running Chrome instance and prepare for fetching.
   */
  public async init(): Promise<void> {
    const endpoints = [
      "http://127.0.0.1:18800/json/version", // Clawdbot managed browser
      "http://127.0.0.1:9222/json/version", // Standard Chrome DevTools
    ];

    for (const endpoint of endpoints) {
      try {
        const resp = await fetch(endpoint);
        const data = z
          .object({ webSocketDebuggerUrl: z.string().optional() })
          .parse(await resp.json());
        const wsUrl = data.webSocketDebuggerUrl;
        if (wsUrl) {
          console.log(`  ✅ Found Chrome at ${endpoint}`);
          this.#browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl,
            defaultViewport: null,
          });
          this.#page = await this.#browser.newPage();

          // Navigate to etherscan to establish Cloudflare clearance
          console.log("  🔐 Establishing Cloudflare clearance...");
          await this.#page.goto("https://etherscan.io/labelcloud", {
            waitUntil: "networkidle2",
            timeout: 60000,
          });

          // Check if we got through Cloudflare
          const title = await this.#page.title();
          if (title.includes("Just a moment")) {
            // Cloudflare challenge - wait for it to resolve
            console.log("  ⏳ Solving Cloudflare challenge...");
            await this.#page.waitForFunction(
              () => !document.title.includes("Just a moment"),
              { timeout: 30000 },
            );
          }

          this.#ready = true;
          console.log("  ✅ Browser fetch ready\n");
          return;
        }
      } catch {
        // try next endpoint
      }
    }

    throw new Error(
      "No Chrome instance found. Start Clawdbot or launch Chrome with:\n" +
        "  /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222",
    );
  }

  /**
   * Fetch HTML content through the browser.
   */
  public async fetchHtml(url: string): Promise<string> {
    if (!this.#page || !this.#ready)
      throw new Error("BrowserFetcher not initialized");

    const result = await this.#page.evaluate(async (fetchUrl: string) => {
      const res = await fetch(fetchUrl);
      return { status: res.status, text: await res.text() };
    }, url);

    if (result.status !== 200 || result.text.includes("Just a moment...")) {
      // Navigate directly to the page to pass Cloudflare challenge
      await this.#page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      // Wait for Cloudflare if needed
      const title = await this.#page.title();
      if (title.includes("Just a moment")) {
        await this.#page.waitForFunction(
          () => !document.title.includes("Just a moment"),
          { timeout: 30000 },
        );
      }

      return await this.#page.content();
    }

    return result.text;
  }

  /**
   * POST JSON through the browser (for token API calls).
   */
  public async postJson(url: string, body: string): Promise<string> {
    if (!this.#page || !this.#ready)
      throw new Error("BrowserFetcher not initialized");

    const result = await this.#page.evaluate(
      async (fetchUrl: string, fetchBody: string) => {
        const res = await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: fetchBody,
        });
        return { status: res.status, text: await res.text() };
      },
      url,
      body,
    );

    if (result.status !== 200 || result.text.includes("Just a moment...")) {
      throw new Error(
        `Cloudflare blocked POST to ${url} (status ${result.status})`,
      );
    }

    return result.text;
  }

  /**
   * Navigate to a URL in the browser and return the rendered HTML.
   * Use this when fetch() gets blocked — full page navigation always works.
   */
  public async navigateAndGetHtml(url: string): Promise<string> {
    if (!this.#page || !this.#ready)
      throw new Error("BrowserFetcher not initialized");

    await this.#page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for Cloudflare if needed
    const title = await this.#page.title();
    if (title.includes("Just a moment")) {
      await this.#page.waitForFunction(
        () => !document.title.includes("Just a moment"),
        { timeout: 30000 },
      );
      // Wait for content to load after challenge
      await new Promise((r) => setTimeout(r, 2000));
    }

    return await this.#page.content();
  }

  /**
   * Close the browser tab (not the browser itself).
   */
  public async close(): Promise<void> {
    if (this.#page) {
      await this.#page.close();
      this.#page = null;
    }
    if (this.#browser) {
      void this.#browser.disconnect();
      this.#browser = null;
    }
    this.#ready = false;
  }
}
