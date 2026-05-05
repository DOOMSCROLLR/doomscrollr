# Changelog

## 0.3.0

- **`npx doomscrollr setup`** — interactive walkthrough that gets users from "never heard of DOOMSCROLLR" to "first authenticated CLI call" in under 60 seconds.
  - Opens browser to free registration if needed
  - Walks user through API key creation in dashboard
  - Saves credentials to `~/.doomscrollr/credentials.json` (chmod 600)
  - Verifies key by calling `/profile` immediately
  - Prints suggested next commands + MCP/SDK upgrade paths
- `npx doomscrollr whoami` — shows currently authenticated account
- `npx doomscrollr logout` — removes stored credentials
- Stored credentials now used as fallback when `DOOMSCROLLR_API_KEY` env var isn't set, so users don't need to re-export per shell

## 0.2.5

- Expanded npm keywords for AI-agent discovery (`ai`, `ai-agents`, MCP, ChatGPT, Claude, OpenAI, automation, ecommerce).

## 0.2.4

- Rewrite README around the audience layer for AI agents.
- Add repo-level AGENTS.md and CLAUDE.md.
- Document CLI, SDK re-export, Homebrew, MCP, and agent docs in one first-screen flow.

