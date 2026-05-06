ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_line_user_id_unique";
-- 改以 (line_user_id, role) 複合唯一限制，允許同一 LINE 帳號綁定不同身分
CREATE UNIQUE INDEX IF NOT EXISTS "users_line_user_id_role_unique"
  ON "users" ("line_user_id", "role")
  WHERE "line_user_id" IS NOT NULL;
