-- Migration: Clear erroneous LINE user IDs from coach accounts
-- Context: Task #198 - Fix LINE parent login role conflict
-- Coach accounts should not have line_user_id set; the parent LINE OAuth
-- callback now uses a role-filtered query (role='parent') to prevent
-- misidentifying a coach account as a parent during LINE login.
-- This cleanup ensures no coach account retains a stale LINE user ID
-- that could cause identity collisions.
UPDATE users
SET line_user_id = NULL,
    updated_at   = NOW()
WHERE role = 'coach'
  AND line_user_id IS NOT NULL;
