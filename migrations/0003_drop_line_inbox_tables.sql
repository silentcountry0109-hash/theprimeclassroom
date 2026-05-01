-- Migration: Drop LINE inbox tables (Task #174)
-- These tables were used by the LINE 收件匣 feature which has been removed.
-- line_messages must be dropped before line_conversations due to FK constraint.
DROP TABLE IF EXISTS line_messages CASCADE;
DROP TABLE IF EXISTS line_conversations CASCADE;
