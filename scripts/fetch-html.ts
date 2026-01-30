export function fetchHtml(url: string, cookie?: string) {
  const headers: Record<string, string> = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
  };
  
  if (cookie) {
    headers['cookie'] = cookie;
  }
  
  return fetch(url, { headers }).then(async (res) => {
    const text = await res.text();
    if (text.includes("Just a moment...") || text.includes("Enable JavaScript and cookies")) {
      console.error(
        '\n❌ Cloudflare protection detected - valid browser cookies required!',
        '\n   The cookie you provided may be expired or invalid.',
        '\n   Please get fresh cookies from your browser and try again.',
      );
      return process.exit(1);
    }
    return text;
  });
}
