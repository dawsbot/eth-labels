export function fetchHtml(url: string) {
  return fetch(url).then(async (res) => {
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
