-- Flyway migration: Update orders status check constraint to include AWAITING_PAYMENT
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status::text = ANY (ARRAY[
    'PENDING'::character varying,
    'AWAITING_PAYMENT'::character varying,
    'CONFIRMED'::character varying,
    'SHIPPING'::character varying,
    'COMPLETED'::character varying,
    'CANCELED'::character varying
  ]::text[])
);
