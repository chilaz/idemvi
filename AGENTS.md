# Base44 Dev Environment

## Overview
Single-file Deno backend (`main.ts`) exposing one POST endpoint,
`/bridge/api/chat`, authenticated with an `X-API-Key` header checked against
`IDEMVI_API_KEY`. `GET /` serves a small static status page (so the preview has an HTML
document to render); every other path returns JSON 404.

## Stack
- **Runtime:** Deno (`denoland/deno` image), no `deno.json` and no third-party imports — nothing to install.
- **Entry point:** `main.ts`, `Deno.serve` on container port 8000, mapped to host port 3000.
- **Dev command:** `deno run --watch --allow-net --allow-env main.ts` (edits hot-restart the watcher; no image rebuild needed).

## Gotcha
- `main.ts` was originally uploaded as an RTF document (TextEdit/Word "rich text"), which Deno
  rejects with `The module's source code could not be parsed: Expected unicode escape at ...:1:2`.
  Always save/upload this file as plain UTF-8 text.

## Secrets
- `IDEMVI_API_KEY` — not required at boot; when unset every chat request returns 403.
  Delivered from `/run/base44/app.env`. `.env.base44-defaults` holds only a placeholder.

## Verification
- `curl http://localhost:3000/` → 200 HTML status page (this is also what the preview shows;
  without it the preview panel only had a JSON 404 to render)
- `curl -X POST http://localhost:3000/bridge/api/chat` → 405
- POST without / with wrong `X-API-Key` → 403
- POST with the real key and `{"action_name":"getDashboardSummary"}` → 200
- Compose healthcheck fetches `/` and expects 200; there is no separate health route.
