-- Add created_at timestamp to orders for reporting
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Backfill existing rows with current timestamp if null
UPDATE orders SET created_at = now() WHERE created_at IS NULL;
