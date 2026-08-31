# TOURVIA — Base44 Dev Environment

## Stack
Single-origin fullstack app: Express server (`server.ts`) on port 3000 that mounts Vite in **middleware mode** to serve the React 19 + Tailwind v4 frontend. No separate frontend/backend processes — one server, one port.

- **Runtime:** Node 22 (via `docker-compose.base44.yml`). The repo ships a `bun.lock` but no `package-lock.json`; deps are installed with `npm install` at container start.
- **Dev command:** `npm run dev` → `tsx server.ts` (TypeScript executed directly, live reload via Vite middleware + chokidar polling).
- **Database:** JSON file at `data/tourvia_db.json` (bind-mounted, seeded in repo). No external DB service. The `Database` class auto-merges missing tables and re-seeds admin accounts on boot.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- App: http://localhost:3000 (mapped `3000:3000`), binds `0.0.0.0`.
- Health check: `GET /api/health`.
- `node_modules` lives in a named volume (`app_node_modules`) so it isn't shadowed by the host bind mount.

## Secrets
- `GEMINI_API_KEY` — Google Gemini key for AI itinerary generation. **Optional at boot**: `server/gemini.ts` falls back to a built-in local generator when unset, so the app is fully previewable without it. Delivered via `/run/base44/app.env` (loaded last in compose, overrides the placeholder in `.env.base44-defaults`).
- `APP_URL` is referenced in `.env.example` but **not used in code**; a placeholder is set in `.env.base44-defaults`.

## Quirks / Setup Notes
- **Vite `allowedHosts`**: the preview is served through a proxy hostname that changes per environment. `vite.config.ts` sets `server.allowedHosts: true` so Vite doesn't 403 the external Host header. Without it, the page returns `403 Blocked request` from the preview origin while `localhost` works.
- **`NODE_ENV=development`** is set in compose so cookies are non-secure (auth routes gate `secure` on `NODE_ENV === 'production'`).
- Frontend calls the API via **relative `/api/...` paths** (single origin) — no API URL env var needed.
- Default admin login: `mohamedseo2002@gmail.com` / PIN `123456` (and `admin@tourvia.app` / `123456`).

## Verifying it works
```
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/            # 200, HTML
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/src/main.tsx # 200, live source
curl -sf http://localhost:3000/api/health                                          # {"status":"ok"}
```
A 403 on the external-Host curl means `allowedHosts` regressed.
