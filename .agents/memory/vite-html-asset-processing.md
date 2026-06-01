---
name: Vite build-html asset processing pitfalls
description: Vite 7 build-html bundles index.html link/meta refs as assets; relative or directory paths crash the production build.
---

# Vite build-html asset processing pitfalls

Vite's `vite:build-html` plugin scans `index.html` during `vite build` and tries to resolve/bundle asset references in `<link href>`, `<script src>`, and (Vite 7+) `<meta property="og:image">` / `<meta name="twitter:image">` `content` attributes. It calls `processAssetUrl` → `fileToBuiltUrl`, which **reads the referenced path from disk**.

**Symptom:** `[vite:build-html] EISDIR: illegal operation on a directory, read` with `✓ 0 modules transformed`, pointing at `index.html`. The dev server (`vite`) does NOT hit this — only the production `build` does, so it passes locally/dev and only fails on deploy.

**Root causes seen:**
- `<link rel="canonical" href="/" />` — `/` resolves to a directory → EISDIR. A relative/root canonical can never go through Vite's bundler.
- Relative public-asset refs like `content="./favicon.png"` — resolved next to `index.html` (not `public/`), so they fail.

**How to apply:**
- Reference public-dir assets with an absolute root path (`/favicon.png`), never `./favicon.png`. Files in `public/` are copied as-is and served at `/`.
- Do NOT add a relative/root `<link rel="canonical">`; if a canonical is truly needed, use a full external URL (`https://domain/...`) or inject it at runtime.
- After editing `index.html`, verify with the actual production build (`PORT=... BASE_PATH=/ pnpm --filter @workspace/<app> run build`), not just typecheck or the dev server — this class of error only surfaces in `vite build`.
