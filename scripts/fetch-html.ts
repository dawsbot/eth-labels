export function fetchHtml(url: string, cookie?: string) {
  const headers: HeadersInit = {};
  if (cookie) {
    headers.Cookie = cookie;
  }

  return fetch(url, { headers }).then(async (res) => {
    const text = await res.text();
    if (text.includes("Just a moment...")) {
      console.error(
        '\nAPI rate limit exceeded for POST to "GetTokensBySubLabel", come back later',
      );
      return process.exit(0);
    }
    return text;
  });
}
