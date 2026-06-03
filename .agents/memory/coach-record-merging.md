---
name: Coach record merging
description: How duplicate coaches rows for the same person are merged at the read/display layer, and why phone is excluded as a merge key.
---

# Coach record merging (師資聚合)

`DatabaseStorage.getCoaches()` merges multiple `coaches` rows that represent the
same person into one `AggregatedCoach` (Coach + `branchNames: string[]`) for
cross-franchise displays (homepage 推薦師資 carousel). DB schema is unchanged —
merge happens only at read time via union-find.

## Merge key: userId OR name (NOT phone)
**Rule:** two rows are the same person if they share a `userId` or share a `name`.

**Why:** the seed/real data reuses a single phone number across genuinely
different teachers (e.g. `0920628178` was on 林佳慧 AND both 黃仁人 rows). Adding
phone to the union wrongly merged distinct people (林佳慧 ended up showing 黃仁人's
branch). userId and name are the only reliable identity signals in this dataset.

**How to apply:** if a future task wants phone as a merge signal, first ensure
phone numbers are unique per person (see `server/simulate-data.ts`). The original
task spec asked for key priority userId > phone > name; we deliberately deviated.

## Notes
- Records can have inconsistent identifiers: one branch row has a `userId`, another
  only a `name` (same person) — union-find handles transitive grouping.
- Same `userId` with different display names (紀硯文 / 蔡孟澔) merges to one card
  using the lowest-id row as representative.
