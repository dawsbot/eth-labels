/**
 * Shared constants for web scraping
 *
 * IMPORTANT: The User-Agent must match the browser that solved the Cloudflare challenge.
 * The cf_clearance cookie is bound to the User-Agent that passed the challenge.
 */

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export const SEC_CH_UA =
  '"Not_A Brand";v="8", "Chromium";v="131", "Google Chrome";v="131"';
