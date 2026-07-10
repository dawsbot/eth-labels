import { scanConfig } from "./scan-config";

type SmokeResult = {
  chainName: string;
  url: string;
  ok: boolean;
  status: number | null;
  reason: string | null;
};

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkLabelCloud(
  chainName: string,
  baseUrl: string,
): Promise<SmokeResult> {
  const url = `${baseUrl.replace(/\/$/, "")}/labelcloud`;
  try {
    const response = await fetchWithTimeout(url, 20_000);
    const html = await response.text();
    const hasLabelCloudMarker =
      html.toLowerCase().includes("label word cloud") ||
      html.toLowerCase().includes("/accounts/label/") ||
      html.toLowerCase().includes("/tokens/label/");

    if (!response.ok) {
      return {
        chainName,
        url,
        ok: false,
        status: response.status,
        reason: `HTTP ${response.status}`,
      };
    }

    if (!hasLabelCloudMarker) {
      return {
        chainName,
        url,
        ok: false,
        status: response.status,
        reason: "Unexpected response body (no labelcloud markers found)",
      };
    }

    return {
      chainName,
      url,
      ok: true,
      status: response.status,
      reason: null,
    };
  } catch (error) {
    return {
      chainName,
      url,
      ok: false,
      status: null,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function main() {
  console.log("Running labelcloud smoke checks...\n");

  const results: Array<SmokeResult> = [];
  for (const chain of scanConfig) {
    const result = await checkLabelCloud(chain.chainName, chain.website);
    results.push(result);

    if (result.ok) {
      console.log(`PASS  ${result.chainName.padEnd(12)} ${result.url}`);
    } else {
      const statusText =
        result.status === null ? "no-status" : `${result.status}`;
      console.log(
        `FAIL  ${result.chainName.padEnd(12)} ${result.url}  (${statusText}: ${result.reason})`,
      );
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  console.log(
    `\nSummary: ${passed}/${results.length} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exit(1);
  }
}

void main();
