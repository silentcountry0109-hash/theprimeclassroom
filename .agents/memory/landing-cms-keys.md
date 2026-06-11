---
name: Landing CMS content keys
description: Where editable landing-page text keys (useSiteContent) must be registered so admins can edit them.
---

Adding a new editable text field to the landing page (a `useSiteContent("section.key", default)` call in `client/src/pages/landing.tsx`) requires THREE coordinated edits, or the key works on the page but is invisible/uneditable in the HQ admin CMS:

1. `client/src/pages/landing.tsx` — the `useSiteContent("section.key", "default")` call that consumes it.
2. `client/src/pages/admin-dashboard.tsx` — the section's `fields: [{ key, label, multiline? }]` array (drives the admin edit form).
3. `client/src/pages/admin-dashboard.tsx` — the defaults map (`"section.key": "default text"`) lower in the same file.

**Why:** the landing page falls back to its inline default, so a missing admin registration is silent — the field renders fine but admins can never override it.
**How to apply:** grep an existing sibling key (e.g. `classflow.step7`) to find all three spots and mirror them for the new key.
