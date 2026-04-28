# doomscrollr

The billboard package for DOOMSCROLLR.

```bash
npm install doomscrollr
```

This package is the simple front door for DOOMSCROLLR’s developer ecosystem. It re-exports the REST API SDK from [`@doomscrollr/api`](https://www.npmjs.com/package/@doomscrollr/api) and points builders to the MCP server and n8n node.

## Use the REST API SDK

```js
import { DoomscrollrApi } from 'doomscrollr';

const doomscrollr = new DoomscrollrApi({
  apiKey: process.env.DOOMSCROLLR_API_KEY,
});

const profile = await doomscrollr.getProfile();
console.log(profile);
```

## Install the specific packages

```bash
npm install @doomscrollr/api
npm install @doomscrollr/mcp-server
npm install @doomscrollr/n8n-nodes-doomscrollr
```

## CLI pointer

```bash
npx doomscrollr
```

## Links

- Website: https://doomscrollr.com
- MCP/API landing: https://mcp.doomscrollr.com
- REST SDK: https://www.npmjs.com/package/@doomscrollr/api
- MCP server: https://www.npmjs.com/package/@doomscrollr/mcp-server
- n8n node: https://www.npmjs.com/package/@doomscrollr/n8n-nodes-doomscrollr
