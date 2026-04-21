#!/bin/sh
set -eu

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

export PGPASSWORD="${POSTGRES_PASSWORD}"
DB_HOST="${DB_HOST:-postgres}"

ensure_role_and_db() {
    db_name="$1"
    db_user="$2"
    db_password="$3"

    escaped_password=$(printf "%s" "$db_password" | sed "s/'/''/g")

    role_exists=$(psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${db_user}'")
    if [ "$role_exists" = "1" ]; then
        psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
            -c "ALTER ROLE \"${db_user}\" WITH LOGIN PASSWORD '${escaped_password}';"
    else
        psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
            -c "CREATE ROLE \"${db_user}\" WITH LOGIN PASSWORD '${escaped_password}';"
    fi

    db_exists=$(psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${db_name}'")
    if [ "$db_exists" != "1" ]; then
        psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
            -c "CREATE DATABASE \"${db_name}\";"
    fi

    psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
        -c "GRANT ALL PRIVILEGES ON DATABASE \"${db_name}\" TO \"${db_user}\";"

    psql -h "$DB_HOST" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
        -c "ALTER DATABASE \"${db_name}\" OWNER TO \"${db_user}\";"

    psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$db_name" -v ON_ERROR_STOP=1 \
        -c "GRANT ALL ON SCHEMA public TO \"${db_user}\";"
}

ensure_role_and_db "${ORDER_DB_NAME:-order_db}" "${ORDER_DB_USER:-order_db}" "${ORDER_DB_PASSWORD:-order_db}"
ensure_role_and_db "${IDENTITY_DB_NAME:-identity_db}" "${IDENTITY_DB_USER:-identity_db}" "${IDENTITY_DB_PASSWORD:-identity_db}"
ensure_role_and_db "${PRODUCT_DB_NAME:-product_db}" "${PRODUCT_DB_USER:-product_db}" "${PRODUCT_DB_PASSWORD:-product_db}"
ensure_role_and_db "${PROMOTION_DB_NAME:-promotion_db}" "${PROMOTION_DB_USER:-promotion_db}" "${PROMOTION_DB_PASSWORD:-promotion_db}"
ensure_role_and_db "${REPORT_DB_NAME:-report_db}" "${REPORT_DB_USER:-report_db}" "${REPORT_DB_PASSWORD:-report_db}"

echo "Database bootstrap completed"
