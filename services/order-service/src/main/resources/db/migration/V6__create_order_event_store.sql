-- flyway migration V6__create_order_event_store.sql

CREATE TABLE IF NOT EXISTS order_events (
    event_id VARCHAR(255) PRIMARY KEY,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    version INT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_events_aggregate_id ON order_events(aggregate_id);

CREATE TABLE IF NOT EXISTS order_read_views (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_code VARCHAR(255) NOT NULL,
    total_amount NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    shipping_address TEXT,
    transaction_id VARCHAR(255),
    items_json TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_read_views_user_id ON order_read_views(user_id);
