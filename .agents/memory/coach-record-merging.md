---
name: Coach record merging
description: How duplicate coach rows for the same person are merged at the read/display layer, and why phone is excluded as a merge key.
---

# Coach record merging (師資聚合)

Multiple coach rows representing the same person are merged into one aggregated
coach (with a list of branch names) at read time for cross-franchise displays
(e.g. homepage 推薦師資 carousel). The DB schema is unchanged — merging happens
only at the read/display layer.

## Merge key: userId OR name (NOT phone)
**Rule:** two rows are treated as the same person if they share a `userId` or
share a `name`.

**Why:** in this dataset a single phone number is reused across genuinely
different teachers, so adding phone to the merge wrongly collapses distinct
people (one teacher ends up showing another's branch). userId and name are the
only reliable identity signals here.

**How to apply:** if a future task wants phone as a merge signal, first guarantee
phone numbers are unique per person. The original spec requested priority
userId > phone > name; we deliberately dropped phone.

## Notes
- Records can have inconsistent identifiers: one branch row has a `userId`,
  another only a `name` (same person) — transitive grouping handles this.
- The same `userId` may carry different display names; merge to one card using a
  stable representative row.
