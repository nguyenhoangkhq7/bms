-- Flyway migration: create initial tables for order-service

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  order_code VARCHAR(255) NOT NULL UNIQUE,
  total_amount numeric(19,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  shipping_address text NOT NULL,
  shipping_latitude double precision NOT NULL,
  shipping_longitude double precision NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  price_at_purchase numeric(19,2) NOT NULL,
  quantity integer NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  total_estimated numeric(19,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  quantity integer NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  amount numeric(19,2) NOT NULL,
  status VARCHAR(50) NOT NULL
);

-- optional foreign keys
ALTER TABLE IF EXISTS order_items
  ADD CONSTRAINT fk_order_items_order
  FOREIGN KEY (order_id) REFERENCES orders(id);

ALTER TABLE IF EXISTS cart_items
  ADD CONSTRAINT fk_cart_items_cart
  FOREIGN KEY (cart_id) REFERENCES carts(id);

ALTER TABLE IF EXISTS payment_transactions
  ADD CONSTRAINT fk_payment_transactions_order
  FOREIGN KEY (order_id) REFERENCES orders(id);
