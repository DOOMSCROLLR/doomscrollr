#!/usr/bin/env node

const DEFAULT_BASE_URL = 'https://doomscrollr.com/api/v1';

const docs = `DOOMSCROLLR

Build and operate owned-audience websites from the command line.

Usage:
  doomscrollr <command> [options]

Auth:
  export DOOMSCROLLR_API_KEY=your_api_key

Commands:
  help                         Show this help
  profile                      Show current DOOMSCROLLR profile/stats
  settings                     Show site/settings summary
  audience [--limit 20]        List subscribers
  posts [--limit 20]           List posts
  products [--limit 20]        List products
  analytics [--days 30]        Show top liked posts
  embed                        Print subscriber-capture embed code/data
  docs                         Print useful DOOMSCROLLR developer links

Options:
  --api-key <key>              Override DOOMSCROLLR_API_KEY
  --base-url <url>             Override API base URL (default: ${DEFAULT_BASE_URL})
  --limit <number>             Limit list output
  --days <number>              Analytics lookback window
  --json                       Print raw JSON

Examples:
  doomscrollr profile
  doomscrollr audience --limit 10
  doomscrollr analytics --days 7
  doomscrollr posts --json

Packages:
  npm install doomscrollr
  npm install @doomscrollr/api
  npm install @doomscrollr/mcp-server
  npm install @doomscrollr/n8n-nodes-doomscrollr
`;

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift() || 'help';
  const options = { json: false };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = args[i + 1];
      if (!value || value.startsWith('--')) {
        options[key] = true;
      } else {
        options[key] = value;
        i += 1;
      }
    }
  }

  return { command, options };
}

function requireApiKey(options) {
  const apiKey = options.apiKey || process.env.DOOMSCROLLR_API_KEY;
  if (!apiKey) {
    console.error('Missing API key. Set DOOMSCROLLR_API_KEY or pass --api-key <key>.');
    console.error('Example: DOOMSCROLLR_API_KEY=... doomscrollr profile');
    process.exit(2);
  }
  return apiKey;
}

async function request(path, options = {}) {
  const apiKey = requireApiKey(options);
  const baseUrl = (options.baseUrl || process.env.DOOMSCROLLR_API_BASE || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const url = new URL(`${baseUrl}${path}`);

  for (const [key, value] of Object.entries(options.query || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data && (data.message || data.error)
      ? data.message || data.error
      : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function output(data, options, formatter) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  formatter(data);
}

function listItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.pages)) return payload.pages;
  return [];
}

function line(title, value) {
  if (value !== undefined && value !== null && value !== '') console.log(`${title}: ${value}`);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const limit = Number(options.limit || 20);

  if (['help', '-h', '--help'].includes(command)) {
    console.log(docs);
    return;
  }

  if (command === 'docs') {
    console.log(`DOOMSCROLLR developer links\n\nWebsite: https://doomscrollr.com\nMCP/API: https://mcp.doomscrollr.com\nREST SDK: https://www.npmjs.com/package/@doomscrollr/api\nMCP server: https://www.npmjs.com/package/@doomscrollr/mcp-server\nn8n node: https://www.npmjs.com/package/@doomscrollr/n8n-nodes-doomscrollr`);
    return;
  }

  if (command === 'profile') {
    const data = await request('/profile', options);
    output(data, options, (profile) => {
      console.log('DOOMSCROLLR profile');
      line('Name', profile.name || profile.account?.name);
      line('Username', profile.username || profile.account?.username);
      line('URL', profile.url || profile.domain || profile.feed_url || profile.account?.url);
      line('Subscribers', profile.subscribers_count ?? profile.subscriber_count ?? profile.stats?.subscribers);
      line('Posts', profile.posts_count ?? profile.post_count ?? profile.stats?.posts);
      line('Products', profile.products_count ?? profile.product_count ?? profile.stats?.products);
    });
    return;
  }

  if (command === 'settings') {
    const data = await request('/settings', options);
    output(data, options, (settings) => {
      console.log('DOOMSCROLLR settings');
      line('Name', settings.name);
      line('Title', settings.title);
      line('Description', settings.description);
      line('Theme', settings.user_theme);
      line('Draft mode', settings.draft_mode);
      line('Desktop grid', settings.desktop_grid);
      line('Mobile grid', settings.mobile_grid);
    });
    return;
  }

  if (command === 'audience') {
    const data = await request('/audience', { ...options, query: { per_page: Math.min(limit, 50) } });
    output(data, options, (payload) => {
      const items = listItems(payload);
      console.log(`Subscribers (${items.length})`);
      for (const item of items) {
        console.log(`- ${item.email || item.email_md5 || item.name || `#${item.id}`} ${item.first_name || item.last_name ? `(${[item.first_name, item.last_name].filter(Boolean).join(' ')})` : ''}`.trim());
      }
    });
    return;
  }

  if (command === 'posts') {
    const data = await request('/posts', { ...options, query: { per_page: Math.min(limit, 50) } });
    output(data, options, (payload) => {
      const items = listItems(payload);
      console.log(`Posts (${items.length})`);
      for (const item of items) {
        console.log(`- ${item.title || 'Untitled'} [${item.status || 'unknown'}] ${item.share_url || item.url || ''}`.trim());
      }
    });
    return;
  }

  if (command === 'products') {
    const data = await request('/products', { ...options, query: { per_page: Math.min(limit, 50) } });
    output(data, options, (payload) => {
      const items = listItems(payload);
      console.log(`Products (${items.length})`);
      for (const item of items) {
        const price = item.price !== undefined && item.price !== null ? `$${item.price}` : '';
        console.log(`- ${item.title || 'Untitled'} ${price} ${item.type ? `[${item.type}]` : ''}`.trim());
      }
    });
    return;
  }

  if (command === 'analytics') {
    const data = await request('/analytics/top-liked-posts', { ...options, query: { days: options.days || 30, limit: Math.min(limit, 50) } });
    output(data, options, (payload) => {
      console.log(`Top liked posts (${payload.days} days, ${payload.total_likes || 0} likes)`);
      for (const post of payload.top_posts || []) {
        console.log(`- ${post.title} — ${post.likes} likes ${post.url || ''}`.trim());
      }
    });
    return;
  }

  if (command === 'embed') {
    const data = await request('/embed', options);
    output(data, options, (payload) => {
      console.log('DOOMSCROLLR embed');
      if (typeof payload === 'string') console.log(payload);
      else console.log(payload.embed_code || payload.html || JSON.stringify(payload, null, 2));
    });
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  console.error(docs);
  process.exit(2);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
