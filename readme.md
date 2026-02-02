<p align="center">
  <a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/etherscan.svg" title="Logo" width="400"/></a>
</p>
<p align="center">
  <b>
    Eth Labels
  </b>
  <br>
  <i>A public dataset of crypto addresses labeled (<a href="https://etherscan.io/labelcloud">Ethereum and MANY more EVM chains</a></i>)
  <br>
</p>

<br/>

## API

A public API to consume this data is available for free. You can [use it remotely here](https://eth-labels-production.up.railway.app/swagger)

<br/>

### Ethereum

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/etherscan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=1)

### Base

<a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/basescan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=8453)

### Arbitrum

<a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/arbiscan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=42161)

### Optimism

<a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/optimism.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=10)

### Binance Smart Chain

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/bscscan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=56)

### Gnosis Chain

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/gnosis.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=100)

### Celo

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/celo.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=42220)

## MCP Server

Give your AI the ability to identify any crypto address. Works with Claude, Cursor, Windsurf, VS Code, and any MCP-compatible client.

**170k+ labeled addresses and tokens across EVM chains.**

> **Requires:** Node.js 18+

### Install

#### Option A: npx (no clone needed)

<!-- Coming soon: `npx eth-labels-mcp` -->

```sh
npm install -g eth-labels-mcp
```

Then use `eth-labels-mcp` as the command in your client config below (instead of the `node /path/to/...` approach).

#### Option B: From source

```sh
git clone https://github.com/dawsbot/eth-labels.git
cd eth-labels/mcp
npm install
npm run build
```

### Add to your AI client

After installing, add the server to your tool. Replace `/absolute/path/to/eth-labels` with where you cloned the repo.

<details>
<summary><b>Claude Code</b> (one-liner)</summary>

```sh
claude mcp add eth-labels -- node /absolute/path/to/eth-labels/mcp/dist/index.js
```

That's it. Claude Code handles the rest.

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Edit your config file:

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| macOS   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json`                     |
| Linux   | `~/.config/Claude/claude_desktop_config.json`                     |

```json
{
  "mcpServers": {
    "eth-labels": {
      "command": "node",
      "args": ["/absolute/path/to/eth-labels/mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop after saving.

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `.cursor/mcp.json` in your project root (or open **Settings → Features → MCP Servers → Add**):

```json
{
  "mcpServers": {
    "eth-labels": {
      "command": "node",
      "args": ["/absolute/path/to/eth-labels/mcp/dist/index.js"]
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "eth-labels": {
      "command": "node",
      "args": ["/absolute/path/to/eth-labels/mcp/dist/index.js"]
    }
  }
}
```

</details>

<details>
<summary><b>VS Code (GitHub Copilot)</b></summary>

Add to `.vscode/settings.json` in your project:

```json
{
  "mcp": {
    "servers": {
      "eth-labels": {
        "command": "node",
        "args": ["/absolute/path/to/eth-labels/mcp/dist/index.js"]
      }
    }
  }
}
```

</details>

<details>
<summary><b>Cline</b></summary>

Open **Cline → MCP Servers → Configure**, then add:

```json
{
  "mcpServers": {
    "eth-labels": {
      "command": "node",
      "args": ["/absolute/path/to/eth-labels/mcp/dist/index.js"]
    }
  }
}
```

</details>

> **💡 Tip:** Always use absolute paths. Relative paths fail silently in most MCP clients.

### Verify it works

Once configured, ask your AI:

```
Who is 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?
```

If it responds with "Vitalik Buterin" — you're in.

### Tools

| Tool             | Description                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| `lookup_address` | Look up any Ethereum/EVM address to get its label and name tag                     |
| `search_labels`  | Search by project name, label, or token symbol (e.g. "uniswap", "binance", "USDC") |
| `dataset_stats`  | Get dataset statistics — 115k+ accounts, 54k+ tokens, 170k+ total entries          |

### Example

Ask your AI: _"Who owns 0xa6baaed2053058a3c8f11e0c7a9716304454b09e?"_

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/mcp-example-1.png" width="600"/>

## Q & A

- Where does this data come from?
  - This data is already organized by the kind folks at Etherscan. Unfortunately that data is not accessible for researchers, so we've copied the data out and into a more shareable format here.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=dawsbot/eth-labels&type=Date)](https://star-history.com/#dawsbot/eth-labels&Date)

## Development

To use this API locally, start it like this:

```sh
bun run dev:api
```

Documentation for the API is available via swagger at `http://localhost:3000/swagger`

### Automated Scraping

This project includes an automated scraper that logs into Etherscan and pulls label data. **No manual cookie copy-paste required!**

#### Setup

1. Create a `.env` file in the project root (see `.env.example`):

```env
ETHERSCAN_USERNAME=your_etherscan_username
ETHERSCAN_PASSWORD=your_etherscan_password
```

2. Start Chrome with remote debugging (one of the following):

**Option A: Clawdbot Managed Browser (recommended if you use Clawdbot)**

- Clawdbot runs a managed Chrome instance at `ws://127.0.0.1:18800`
- The scraper will automatically detect and use it

**Option B: Manual Chrome with DevTools**

```sh
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222
```

**Option C: Manual Cookie (fallback)**
If you can't run Chrome with remote debugging, you can manually extract cookies:

1. Log into Etherscan in your browser
2. Open DevTools → Application → Cookies → https://etherscan.io
3. Copy all cookies as a single string: `name1=value1; name2=value2; ...`
4. Add to `.env`: `ETHERSCAN_COOKIE=your_cookie_string_here`

5. Run the scraper:

```sh
bun run pull
```

#### How it works

The scraper uses **Chrome DevTools Protocol (CDP)** to connect to an already-running Chrome instance:

1. Detects Chrome running at port 18800 (Clawdbot) or 9222 (standard DevTools)
2. Connects via CDP (not launching a new browser — avoids Cloudflare automation detection!)
3. Opens a new tab and navigates to etherscan.io/login
4. Fills in credentials from environment variables
5. Waits for you to solve the CAPTCHA (if present)
6. Extracts cookies using CDP (including httpOnly cookies)
7. Closes only the login tab (browser stays running)
8. Uses those cookies for all subsequent requests

**Why CDP?** Connecting to a real Chrome instance avoids Cloudflare's automation detection. Unlike Puppeteer's `launch()`, which gets blocked, connecting to an existing browser looks like a normal browsing session.
