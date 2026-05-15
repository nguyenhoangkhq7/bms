-- Flyway migration: shipping configuration and pricing breakdown

CREATE TABLE IF NOT EXISTS store_info (
  id BIGSERIAL PRIMARY KEY,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL
);

CREATE TABLE IF NOT EXISTS shipping_rules (
  id BIGSERIAL PRIMARY KEY,
  min_distance double precision NOT NULL,
  max_distance double precision,
  fee numeric(19,2) NOT NULL
);

INSERT INTO store_info (latitude, longitude)
SELECT 10.822159, 106.686824
WHERE NOT EXISTS (SELECT 1 FROM store_info);

INSERT INTO shipping_rules (min_distance, max_distance, fee)
SELECT 0, 50, 0
WHERE NOT EXISTS (SELECT 1 FROM shipping_rules WHERE min_distance = 0 AND max_distance = 50);

INSERT INTO shipping_rules (min_distance, max_distance, fee)
SELECT 50, 300, 20000
WHERE NOT EXISTS (SELECT 1 FROM shipping_rules WHERE min_distance = 50 AND max_distance = 300);

INSERT INTO shipping_rules (min_distance, max_distance, fee)
SELECT 300, NULL, 30000
WHERE NOT EXISTS (SELECT 1 FROM shipping_rules WHERE min_distance = 300 AND max_distance IS NULL);

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric(19,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS base_shipping_fee numeric(19,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_discount numeric(19,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_discount numeric(19,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_total numeric(19,2) NOT NULL DEFAULT 0;
