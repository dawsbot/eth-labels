import type { BrowserFetcher } from "./browser-fetch";

/**
 * Fetch HTML through the browser to bypass Cloudflare.
 * Falls back to direct fetch if no browser is available.
 */
export async function fetchHtml(url: string, browserFetcher?: BrowserFetcher): Promise<string> {
  if (browserFetcher) {
    return browserFetcher.fetchHtml(url);
  }

  // Fallback: direct fetch (will likely get blocked by Cloudflare)
  const res = await fetch(url);
  const text = await res.text();
  if (text.includes("Just a moment...")) {
    console.error(
      "\nCloudflare blocked the request. A running Chrome browser is required.",
      "\nStart Clawdbot or launch Chrome with: --remote-debugging-port=9222",
    );
    return process.exit(0);
  }
  return text;
}
