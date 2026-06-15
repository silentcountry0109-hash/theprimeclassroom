---
name: School list dual sources
description: School dropdowns merge the built-in static list with HQ-added DB custom schools.
---

# School list has two sources

Elementary-school dropdowns are NOT purely the static `shared/taiwan-schools.ts` list anymore. HQ admins can add missing schools via 學校管理 (admin-dashboard `SchoolManagementTab`), stored in the `custom_schools` table (city, district, name; unique on all three).

**Rule:** Any school dropdown must merge built-in + custom via `getMergedDistricts` / `getMergedSchools` from `shared/taiwan-schools.ts`, fed by the `useCustomSchools()` react-query hook (`client/src/hooks/use-custom-schools.ts`, GET `/api/custom-schools`). Do not call the raw `getDistricts`/`getSchools` directly for user-facing pickers, or HQ-added schools will silently not appear.

**Why:** Built-in list is immutable (task forbids editing it); custom additions live only in the DB and are merged client-side.

**How to apply:** Consumers today are parent-dashboard (child school binding) and franchise-admin (walk-in registration). Admin add-form uses plain `getDistricts` for district options (only built-in districts) but the browse/list view uses merged helpers + shows 內建/自訂 badges; only 自訂 rows are deletable. Duplicate guard lives in POST `/api/admin/custom-schools` (checks built-in via `getSchools` + existing custom rows).
