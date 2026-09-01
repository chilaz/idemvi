# Base44 Dev Environment

## Overview
This is a single-file Deno backend (`main.ts`) that exposes a POST endpoint at
`/bridge/api/chat`. Requests are authenticated via an `X-API-Key` header checked
against the `IDEMVI_API_KEY` environment variable.

## Stack
- **Runtime:** Deno (official `denoland/deno` image)
- **Entry point:** `main.ts` — `Deno.serve` on container port 8000, mapped to host port 3000
- **Dev command:** `deno run --watch --allow-net --allow-env main.ts` (live reload on file changes)

## Secrets
- `IDEMVI_API_KEY` — required for authenticated requests; the app still boots without it
  but returns 403 on the chat endpoint. Delivered via `/run/base44/app.env`.

## Verification
- `curl http://localhost:3000/` → 404 JSON (server alive, no route match)
- `curl -X POST http://localhost:3000/bridge/api/chat` (no key) → 403
- `curl -X POST -H "X-API-Key: $IDEMVI_API_KEY" -H "Content-Type: application/json" -d '{"action_name":"getDashboardSummary"}' http://localhost:3000/bridge/api/chat` → 200 with summary

## Notes
- The original `main.ts` was uploaded as RTF-wrapped text; it was rewritten as clean TypeScript without changing any logic.
