-- Task #283: 買X送Y 方案與新退款公式
-- 在 credit_packages 加贈送堂獨立到期日；在 credit_balances 加入桶別（付費/贈送）。
-- 既有資料一律標記為 'paid'，避免改變既有退款行為。

ALTER TABLE credit_packages
  ADD COLUMN IF NOT EXISTS bonus_expiry_days integer;

ALTER TABLE credit_balances
  ADD COLUMN IF NOT EXISTS credit_type text NOT NULL DEFAULT 'paid';
