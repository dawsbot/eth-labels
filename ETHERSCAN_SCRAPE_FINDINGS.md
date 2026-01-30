# Etherscan Scraping Issues & Fixes

**Date:** 2026-01-29
**Status:** Cloudflare protection now blocks ALL Etherscan requests

## Problem Summary

Etherscan has added Cloudflare protection to their entire site (not just APIs). All requests without valid browser cookies are blocked with "Just a moment..." challenge page.

### What's Blocked

- ✅ **Labelcloud page** (`/labelcloud`) - Actually WORKS if requested directly via browser/curl with proper headers
- ❌ **Account label pages** (`/accounts/label/exchange`) - BLOCKED by Cloudflare
- ❌ **Token label pages** (`/tokens/label/*`) - BLOCKED by Cloudflare  
- ❌ **Token API** (`/tokens.aspx/GetTokensBySubLabel`) - BLOCKED by Cloudflare

### Root Cause

The scraper uses plain `fetch()` without browser cookies. Cloudflare now requires:
1. Valid cookies from a real browser session
2. Proper User-Agent and headers
3. Potentially JavaScript challenge completion

## Current Code Issues

### 1. Cookie Prompt is Commented Out (`scripts/cli.ts`)

```typescript
// const answer = await inquirer.prompt<{ cookie: string }>([...]);
const cookie = `TODO_COOKIE_HERE`; // ❌ Hardcoded placeholder
```

### 2. `fetch-html.ts` Doesn't Accept Cookies

```typescript
export function fetchHtml(url: string) {
  return fetch(url).then(async (res) => { // ❌ No cookie parameter
```

### 3. Misleading Error Message

When Cloudflare blocks, the error says "API rate limit exceeded" but it's actually Cloudflare protection.

## Fixes Required

### Fix 1: Enable Cookie Prompt

**File:** `scripts/cli.ts`

Uncomment the cookie prompt to allow users to paste their browser cookies.

### Fix 2: Update `fetchHtml` to Accept Cookies

**File:** `scripts/fetch-html.ts`

Add cookie parameter and pass it in headers:

```typescript
export function fetchHtml(url: string, cookie?: string) {
  return fetch(url, {
    headers: {
      'cookie': cookie || '',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    }
  }).then(async (res) => {
```

### Fix 3: Pass Cookies Through Chain Puller

Update all chain puller code to thread cookies through to fetch calls.

### Fix 4: Update Error Message

Change "API rate limit" to "Cloudflare protection detected - valid cookies required"

## How to Get Cookies (User Instructions)

1. Open Chrome/Firefox
2. Go to `https://etherscan.io`
3. Complete any Cloudflare challenge
4. Open DevTools (F12) → Network tab
5. Refresh page
6. Click any request to etherscan.io
7. Copy the `Cookie:` header value (full string)
8. Paste it when the scraper prompts for cookies

Cookies expire after ~24 hours, so users need to refresh them periodically.

## Alternative Solutions (Future)

If cookie management becomes too burdensome:

1. **Puppeteer/Playwright**: Use headless browser to handle Cloudflare automatically
2. **Cookie Store**: Save cookies to a file and auto-refresh
3. **Proxy Service**: Use a service that handles Cloudflare challenges
4. **API Key**: Etherscan has official APIs, though they may not include label data

## Testing

Created diagnostic scripts:
- `test-etherscan.ts` - Basic connectivity test
- `test-full-flow.ts` - Full parsing flow test

Both confirm Cloudflare blocks all pages without valid cookies.

## Timeboxed (15 min) Status

- ✅ Identified root cause (Cloudflare on all pages)
- ✅ Created fixes for cookie handling
- ⚠️ Need to test with real cookies (requires user to provide)
- ⚠️ Full integration testing pending

## Next Steps

1. Apply all fixes to code
2. Test with real browser cookies
3. Update README with cookie instructions
4. Consider adding Puppeteer for auto-cookie handling
