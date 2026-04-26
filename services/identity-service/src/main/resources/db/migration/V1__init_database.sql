-- 1. Tạo bảng users với id là BIGSERIAL (Tương đương Long tự tăng)
CREATE TABLE users (
                     id BIGSERIAL PRIMARY KEY,
                     username VARCHAR(255) NOT NULL UNIQUE,
                     password VARCHAR(255) NOT NULL,
                     email VARCHAR(255) NOT NULL UNIQUE,
                     full_name VARCHAR(255),
                     date_of_birth DATE,
                     role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER'
                       CHECK (role IN ('CUSTOMER', 'ADMIN')),
                     status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
                       CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED'))
);

-- 2. Tạo bảng addresses
CREATE TABLE addresses (
                         id BIGSERIAL PRIMARY KEY,
                         user_id BIGINT NOT NULL,
                         phone_number VARCHAR(20) NOT NULL,
                         street_address TEXT NOT NULL,
                         ward VARCHAR(100) NOT NULL,
                         district VARCHAR(100) NOT NULL,
                         city_province VARCHAR(100) NOT NULL,
                         latitude DECIMAL(10, 8),
                         longitude DECIMAL(11, 8),
                         CONSTRAINT fk_addresses_users FOREIGN KEY (user_id)
                           REFERENCES users (id) ON DELETE CASCADE
);
