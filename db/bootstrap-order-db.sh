#!/bin/sh
set -eu

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${ORDER_DB_NAME:?ORDER_DB_NAME is required}"
: "${ORDER_DB_USER:?ORDER_DB_USER is required}"
: "${ORDER_DB_PASSWORD:?ORDER_DB_PASSWORD is required}"

export PGPASSWORD="${POSTGRES_PASSWORD}"
DB_HOST="${DB_HOST:-postgres}"

ESCAPED_PASSWORD=$(printf "%s" "$ORDER_DB_PASSWORD" | sed "s/'/''/g")

role_exists=$(psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${ORDER_DB_USER}'")
if [ "$role_exists" = "1" ]; then
    psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
        -c "ALTER ROLE \"${ORDER_DB_USER}\" WITH LOGIN PASSWORD '${ESCAPED_PASSWORD}';"
else
    psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
        -c "CREATE ROLE \"${ORDER_DB_USER}\" WITH LOGIN PASSWORD '${ESCAPED_PASSWORD}';"
fi

db_exists=$(psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${ORDER_DB_NAME}'")
if [ "$db_exists" != "1" ]; then
    psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
        -c "CREATE DATABASE \"${ORDER_DB_NAME}\";"
fi

psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "GRANT ALL PRIVILEGES ON DATABASE \"${ORDER_DB_NAME}\" TO \"${ORDER_DB_USER}\";"

psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$ORDER_DB_NAME" -v ON_ERROR_STOP=1 \
    -c "GRANT USAGE, CREATE ON SCHEMA public TO \"${ORDER_DB_USER}\";"
