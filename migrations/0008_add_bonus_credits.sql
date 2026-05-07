ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS bonus_credits integer NOT NULL DEFAULT 0;
