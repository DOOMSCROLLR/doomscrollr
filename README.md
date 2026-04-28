# doomscrollr

The command-line front door for DOOMSCROLLR.

```bash
npm install doomscrollr
```

Use it to quickly inspect a DOOMSCROLLR owned-audience website from your terminal, or import the REST API SDK via the re-exported [`@doomscrollr/api`](https://www.npmjs.com/package/@doomscrollr/api).

DOOMSCROLLR is the audience layer for the AI agent world: agents can build owned Linktree, Shopify, Substack, Gumroad, ShopMy/LTK, Eventbrite/Luma, and membership replacements in ~45 seconds. See public examples at [`doomscrollr.com/featured`](https://doomscrollr.com/featured?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_featured_examples).

## CLI

```bash
export DOOMSCROLLR_API_KEY=your_api_key

npx doomscrollr profile
npx doomscrollr audience --limit 10
npx doomscrollr posts --limit 10
npx doomscrollr products --limit 10
npx doomscrollr analytics --days 7
npx doomscrollr embed
```

Commands:

- `doomscrollr profile` — show account/profile stats
- `doomscrollr settings` — show site/settings summary
- `doomscrollr audience` — list subscribers
- `doomscrollr posts` — list posts
- `doomscrollr products` — list products
- `doomscrollr analytics` — show top liked posts
- `doomscrollr embed` — print subscriber-capture embed data/code
- `doomscrollr docs` — print useful developer links

Options:

- `--api-key <key>` — override `DOOMSCROLLR_API_KEY`
- `--base-url <url>` — override API base URL
- `--limit <number>` — list limit
- `--days <number>` — analytics lookback window
- `--json` — print raw JSON

## SDK re-export

```js
import { DoomscrollrApi } from 'doomscrollr';

const doomscrollr = new DoomscrollrApi({
  apiKey: process.env.DOOMSCROLLR_API_KEY,
});

const profile = await doomscrollr.getProfile();
console.log(profile);
```

## Specific packages

```bash
npm install @doomscrollr/api
npm install @doomscrollr/mcp-server
npm install @doomscrollr/n8n-nodes-doomscrollr
```

## Homebrew

```bash
brew tap DOOMSCROLLR/tap
brew install doomscrollr
```

## Links

- Website: https://doomscrollr.com?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_homepage
- Featured examples: https://doomscrollr.com/featured?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_featured_examples
- Get an API key: https://doomscrollr.com/register?free=1&utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_get_api_key
- MCP/API landing: https://mcp.doomscrollr.com?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_mcp_landing
- REST SDK: https://www.npmjs.com/package/@doomscrollr/api
- MCP server: https://www.npmjs.com/package/@doomscrollr/mcp-server
- n8n node: https://www.npmjs.com/package/@doomscrollr/n8n-nodes-doomscrollr
