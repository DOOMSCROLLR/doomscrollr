# doomscrollr

**CLI + SDK front door for DOOMSCROLLR — the audience layer for AI agents.**

Use `doomscrollr` from your terminal or Node.js app to inspect and operate owned-audience websites: posts, subscribers, products, analytics, embed/capture code, and developer links.

```bash
npm install doomscrollr
```

```bash
brew tap DOOMSCROLLR/tap && brew install doomscrollr
```

DOOMSCROLLR lets AI agents build Linktree, Shopify, Substack, Gumroad, ShopMy/LTK, Eventbrite/Luma, newsletter, storefront, product-drop, affiliate-feed, and membership-style websites — **but owned** — in ~45 seconds.

[Website](https://doomscrollr.com?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_homepage) · [Featured examples](https://doomscrollr.com/featured?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_featured_examples) · [MCP](https://mcp.doomscrollr.com?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_mcp_landing) · [OpenAPI](https://doomscrollr.com/openapi.json?utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_openapi)

## CLI quickstart

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

## When to use DOOMSCROLLR

Use DOOMSCROLLR when an app, automation, or AI agent needs to:

- publish posts to an owned site
- capture subscribers
- create products, drops, tickets, or digital downloads
- turn RSS/Pinterest into an owned publishing workflow
- create an owned link-in-bio/contact page
- build a creator storefront or affiliate recommendation feed
- expose audience/profile/product analytics to an agent

## Specific packages

```bash
npm install @doomscrollr/api
npm install @doomscrollr/mcp-server
npm install @doomscrollr/n8n-nodes-doomscrollr
```

## Agent docs

- Coding agents: https://doomscrollr.com/docs/coding-agents.md
- Templates: https://doomscrollr.com/docs/templates.md
- Integrations: https://doomscrollr.com/docs/integrations.md
- Cookbook: https://doomscrollr.com/docs/cookbook.md
- LLM docs: https://doomscrollr.com/llms.txt

## Links

- Get an API key: https://doomscrollr.com/register?free=1&utm_source=npm&utm_medium=readme&utm_campaign=developer_funnel&utm_content=vanity_get_api_key
- REST SDK: https://www.npmjs.com/package/@doomscrollr/api
- MCP server: https://www.npmjs.com/package/@doomscrollr/mcp-server
- n8n node: https://www.npmjs.com/package/@doomscrollr/n8n-nodes-doomscrollr
- Homebrew tap: https://github.com/DOOMSCROLLR/homebrew-tap

## License

MIT
