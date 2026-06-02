---
name: Screenshotting mockup-sandbox previews
description: How to capture a rendered mockup-sandbox component preview when the main app workflow is not running.
---

The `screenshot` tool with `type: app_preview` always navigates to `localhost:5000`,
which is the **main app** ("Start application" workflow). The mockup-sandbox
component preview server runs on its own Vite port and is proxied at `/__mockup/`.

**Rule:** To screenshot a mockup-sandbox component preview, use
`screenshot` with `type: external_url` and the full dev domain:
`https://<REPLIT_DOMAINS-first-entry>/__mockup/preview/<group>/<ComponentName>`.

**Why:** `app_preview` → `localhost:5000` returns `ERR_CONNECTION_REFUSED` when the
main app isn't started, and even when it is, `:5000` does not serve the isolated
component preview. The canvas iframes themselves use this same `/__mockup/preview/`
URL on the dev domain.

**How to apply:** Get the domain via `echo "$REPLIT_DOMAINS" | tr ',' '\n' | head -1`,
then build the URL. No port in the URL — the `/__mockup/` proxy handles routing.
