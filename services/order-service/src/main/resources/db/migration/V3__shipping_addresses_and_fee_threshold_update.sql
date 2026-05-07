CREATE TABLE IF NOT EXISTS shipping_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id bigint NOT NULL,
  recipient_name varchar(255) NOT NULL,
  phone_number varchar(50) NOT NULL,
  address_line text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);

UPDATE shipping_rules
SET max_distance = 500, fee = 25000
WHERE min_distance = 50 AND max_distance = 300;

UPDATE shipping_rules
SET min_distance = 500, fee = 50000
WHERE min_distance = 300 AND max_distance IS NULL;

INSERT INTO shipping_rules (min_distance, max_distance, fee)
SELECT 50, 500, 25000
WHERE NOT EXISTS (
  SELECT 1 FROM shipping_rules WHERE min_distance = 50 AND max_distance = 500
);

INSERT INTO shipping_rules (min_distance, max_distance, fee)
SELECT 500, NULL, 50000
WHERE NOT EXISTS (
  SELECT 1 FROM shipping_rules WHERE min_distance = 500 AND max_distance IS NULL
);
