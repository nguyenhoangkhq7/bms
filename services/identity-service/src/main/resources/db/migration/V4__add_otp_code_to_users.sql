-- Thêm cột otp_code vào bảng users để hỗ trợ luồng Quên Mật Khẩu bằng OTP
ALTER TABLE users ADD COLUMN otp_code VARCHAR(6);
