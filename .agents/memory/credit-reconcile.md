---
name: Credit balance reconciliation
description: How to safely reconcile family credit wallets without corrupting legitimately-seeded test/demo accounts.
---

# Credit balance reconciliation

Reconcile each credit bucket to `original_credits ± net(deduct/refund txns for that balance_id)`, clamped to `[0, original_credits]`. Do NOT reconcile by comparing a parent's global wallet balance to the sum of all their transactions.

**Why:** Many real (non-`sim-%`) accounts are seeded directly into `credit_balances` (e.g. `ts361_parent_*`, `line-*`, `parent-test*`) with `remaining_credits` set but zero matching transactions. A global "balance vs net-tx" check flags all of these as broken (balance 2 vs net 0) and would wrongly zero them out. A per-bucket check (original ± deduct/refund) leaves them alone because remaining == original and there are no deduct/refund txns.

**How to apply:** When writing/auditing `reconcileCreditBalances`, skip `sim-%` accounts and any parent with a `payment_refund` tx or unattributed (null `balanceId`) deduct/refund tx (manual review). Always run dry-run first; the data-correction endpoint is admin-run, not auto-run. Reconcile does NOT retroactively charge for confirmed bookings that lack a deduct tx (seed/demo artifacts like `parent-parent1/2`) — only fixes balance-vs-bucket-ledger drift.
