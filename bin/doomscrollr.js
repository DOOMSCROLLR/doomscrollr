#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';

const DEFAULT_BASE_URL = 'https://doomscrollr.com/api/v1';
const CREDENTIALS_DIR = path.join(os.homedir(), '.doomscrollr');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.json');

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
  setup                        Interactive walkthrough — register, get API key, save locally
  whoami                       Show which account is currently authenticated
  logout                       Remove stored credentials

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

function loadStoredCredentials() {
  try {
    if (!fs.existsSync(CREDENTIALS_FILE)) return null;
    const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCredentials(creds) {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), { mode: 0o600 });
}

function clearCredentials() {
  try { fs.unlinkSync(CREDENTIALS_FILE); } catch {}
}

function requireApiKey(options) {
  // Priority: --api-key flag > env var > stored credentials > error
  const flagKey = options.apiKey;
  const envKey = process.env.DOOMSCROLLR_API_KEY;
  const stored = loadStoredCredentials();
  const apiKey = flagKey || envKey || stored?.apiKey;
  if (!apiKey) {
    console.error('No API key found.');
    console.error('');
    console.error('Quickest path: run `npx doomscrollr setup` for an interactive walkthrough.');
    console.error('Or: export DOOMSCROLLR_API_KEY=your_key and re-run.');
    process.exit(2);
  }
  return apiKey;
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function openInBrowser(url) {
  const platform = os.platform();
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  try { spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref(); return true; }
  catch { return false; }
}

async function runSetup(options) {
  console.log('');
  console.log('  ____   ___   ___  __  __ ____   ____ ____   ___  _     _     ____  ');
  console.log(' |  _ \\ / _ \\ / _ \\|  \\/  / ___| / ___|  _ \\ / _ \\| |   | |   |  _ \\ ');
  console.log(' | | | | | | | | | | |\\/| \\___ \\| |   | |_) | | | | |   | |   | |_) |');
  console.log(' | |_| | |_| | |_| | |  | |___) | |___|  _ <| |_| | |___| |___|  _ < ');
  console.log(' |____/ \\___/ \\___/|_|  |_|____/ \\____|_| \\_\\\\___/|_____|_____|_| \\_\\');
  console.log('');
  console.log('  Welcome. This walkthrough takes <60 seconds.');
  console.log('  We\'ll help you create an account (free) and connect this CLI.');
  console.log('');

  // Step 1: register account
  const existing = loadStoredCredentials();
  if (existing && existing.apiKey) {
    const replace = await prompt(`  You're already set up as ${existing.email || 'a user'}. Re-link a different account? [y/N] `);
    if (replace.toLowerCase() !== 'y') {
      console.log('  No changes. Try `doomscrollr profile` to see your current account.');
      return;
    }
  }

  console.log('  STEP 1 of 2: Create your free DOOMSCROLLR account.');
  console.log('');
  const hasAccount = await prompt('  Do you already have a DOOMSCROLLR account? [y/N] ');
  if (hasAccount.toLowerCase() !== 'y') {
    console.log('  Opening registration in your browser...');
    const opened = openInBrowser('https://doomscrollr.com/register?free=1&utm_source=cli&utm_medium=setup');
    if (!opened) {
      console.log('  Couldn\'t auto-open. Visit:');
      console.log('    https://doomscrollr.com/register?free=1');
    }
    console.log('');
    await prompt('  Press Enter when you\'ve finished signing up...');
  }

  // Step 2: get API key
  console.log('');
  console.log('  STEP 2 of 2: Get your API key.');
  console.log('');
  console.log('  In your DOOMSCROLLR dashboard:');
  console.log('    1. Go to Settings → API Keys');
  console.log('    2. Click "Create API Key"');
  console.log('    3. Copy the key');
  console.log('');
  const openDash = await prompt('  Open the dashboard for you? [Y/n] ');
  if (openDash.toLowerCase() !== 'n') {
    openInBrowser('https://doomscrollr.com/dashboard/settings/api-keys?utm_source=cli&utm_medium=setup');
  }
  console.log('');
  const apiKey = await prompt('  Paste your API key here: ');
  if (!apiKey || apiKey.length < 10) {
    console.error('  That doesn\'t look like a valid key. Try `npx doomscrollr setup` again.');
    process.exit(2);
  }

  // Step 3: verify
  console.log('');
  console.log('  Verifying...');
  try {
    const profile = await request('/profile', { ...options, apiKey });
    saveCredentials({
      apiKey,
      email: profile.email || profile.account?.email,
      username: profile.username || profile.account?.username,
      url: profile.url || profile.domain || profile.account?.url,
      savedAt: new Date().toISOString(),
    });
    console.log('  ✅ Connected.');
    console.log('');
    console.log(`     Account:     ${profile.username || profile.account?.username || '(unknown)'}`);
    console.log(`     Site URL:    ${profile.url || profile.domain || profile.account?.url || '(none yet)'}`);
    console.log(`     Subscribers: ${profile.subscribers_count ?? profile.stats?.subscribers ?? 0}`);
    console.log(`     Posts:       ${profile.posts_count ?? profile.stats?.posts ?? 0}`);
    console.log(`     Products:    ${profile.products_count ?? profile.stats?.products ?? 0}`);
    console.log('');
    console.log('  Saved to ~/.doomscrollr/credentials.json (chmod 600)');
    console.log('');
    console.log('  Try these next:');
    console.log('    doomscrollr profile     # see your account stats');
    console.log('    doomscrollr posts        # list your posts');
    console.log('    doomscrollr audience     # list your subscribers');
    console.log('    doomscrollr docs         # developer links + MCP/API references');
    console.log('');
    console.log('  Or pipe DOOMSCROLLR into your AI agent stack:');
    console.log('    npm install -g @doomscrollr/mcp-server   # MCP server for Claude Code, Cursor, OpenClaw');
    console.log('    https://mcp.doomscrollr.com               # hosted MCP endpoint for any agent');
    console.log('');
  } catch (err) {
    console.error(`  ❌ Verification failed: ${err.message}`);
    console.error('  Double-check your API key. Try `npx doomscrollr setup` again.');
    process.exit(2);
  }
}

async function runWhoami(options) {
  const stored = loadStoredCredentials();
  if (!stored) {
    console.log('Not authenticated. Run `npx doomscrollr setup` to connect.');
    process.exit(2);
  }
  console.log(`Authenticated as: ${stored.username || stored.email || '(unknown)'}`);
  console.log(`Site URL:         ${stored.url || '(none)'}`);
  console.log(`Saved at:         ${stored.savedAt || '(unknown)'}`);
  console.log(`Credentials file: ${CREDENTIALS_FILE}`);
}

function runLogout() {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.log('Already logged out (no credentials stored).');
    return;
  }
  clearCredentials();
  console.log('Logged out. Credentials removed from ~/.doomscrollr/credentials.json');
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

  if (command === 'setup' || command === 'init' || command === 'login') {
    await runSetup(options);
    return;
  }

  if (command === 'whoami') {
    await runWhoami(options);
    return;
  }

  if (command === 'logout') {
    runLogout();
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
