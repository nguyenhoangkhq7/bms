-- 1. Insert dữ liệu mẫu cho bảng users
INSERT INTO users (id, username, password, email, full_name, date_of_birth, role, status)
VALUES
  (1, 'admin_minh', '123456', 'admin.minh@bookstore.com', 'Nguyễn Văn Minh', '1995-10-20', 'ADMIN', 'ACTIVE'),
  (2, 'khach_hang_hoa', '123456', 'hoa.tran@gmail.com', 'Trần Thị Hoa', '2001-05-15', 'CUSTOMER', 'ACTIVE'),
  (3, 'khach_hang_tuan', '123456', 'tuan.le@yahoo.com', 'Lê Anh Tuấn', '1998-12-01', 'CUSTOMER', 'BLOCKED');

-- 2. Insert dữ liệu mẫu cho bảng addresses
INSERT INTO addresses (id, user_id, phone_number, street_address, ward, district, city_province, latitude, longitude)
VALUES
  (1, 2, '0901234567', '12 Nguyễn Văn Bảo', 'Phường 4', 'Quận Gò Vấp', 'TP. Hồ Chí Minh', 10.822158, 106.686846),
  (2, 2, '0909999888', 'Số 2 Hải Triều', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 10.771542, 106.705696),
  (3, 3, '0987654321', '15 Lê Lợi', 'Phường Thạch Thang', 'Quận Hải Châu', 'Đà Nẵng', 16.071850, 108.223004);

-- 3. ĐỒNG BỘ LẠI BỘ ĐẾM TỰ TĂNG (Rất quan trọng)
-- Vì chúng ta đã chèn cứng id (1, 2, 3) bằng tay, chúng ta phải nhắc Postgres
-- dời bộ đếm tự tăng (sequence) lên số lớn nhất hiện tại.
-- Nếu không, khi Java thêm user mới, Postgres sẽ cấp lại số 1 và gây lỗi trùng lặp khóa chính.
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('addresses_id_seq', (SELECT MAX(id) FROM addresses));
