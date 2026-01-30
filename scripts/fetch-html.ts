import { USER_AGENT } from "./utils/constants";

export function fetchHtml(url: string, cookie?: string) {
  const headers: HeadersInit = {
    "user-agent": USER_AGENT,
  };
  if (cookie) {
    headers.Cookie = cookie;
  }

  return fetch(url, { headers }).then(async (res) => {
    const text = await res.text();
    if (text.includes("Just a moment...")) {
      console.error(
        "\nCloudflare blocked the request. Your cookies may have expired.",
      );
      return process.exit(0);
    }
    return text;
  });
}
