#!/bin/bash
set -e

create_user_and_database() {
    local database=$1
    echo "  Creating user and database '$database'"
    
    # Khối 1: Vẫn giữ nguyên (Tạo DB và User)
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE USER $database WITH PASSWORD '$database';
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
EOSQL

    # Khối 2: THÊM ĐOẠN NÀY VÀO! 
    # Kết nối trực tiếp vào database vừa tạo (--dbname "$database") để cấp quyền Schema
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$database" <<-EOSQL
        GRANT ALL ON SCHEMA public TO $database;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database $db
    done
    echo "Multiple databases created"
fi