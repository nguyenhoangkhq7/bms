CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE books
ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS books_embedding_hnsw_idx
ON books USING hnsw (embedding vector_cosine_ops);

INSERT INTO books (
	id,
	title,
	author,
	publisher,
	price,
	stock_quantity,
	status,
	description,
	image_url,
	category_id,
	parent_category_id
) VALUES
(1001, 'Cha Giàu Cha Nghèo', 'Robert T. Kiyosaki', 'NXB Trẻ', 120000, 20, 'AVAILABLE', 'Sách kinh điển về tư duy tài chính cá nhân, dòng tiền và đầu tư.', 'https://example.com/cha-giau-cha-ngheo.jpg', 105, 2),
(1002, 'Đắc Nhân Tâm', 'Dale Carnegie', 'NXB Tổng Hợp', 98000, 18, 'AVAILABLE', 'Cuốn sách về nghệ thuật giao tiếp, thuyết phục và xây dựng quan hệ tốt đẹp.', 'https://example.com/dac-nhan-tam.jpg', 110, 4),
(1003, 'English Grammar in Use', 'Raymond Murphy', 'Cambridge', 215000, 15, 'AVAILABLE', 'Giáo trình ngữ pháp tiếng Anh thực hành cho người học ở nhiều trình độ.', 'https://example.com/english-grammar-in-use.jpg', 119, 7),
(1004, 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 265000, 12, 'AVAILABLE', 'Sách hướng dẫn viết mã sạch, dễ đọc và dễ bảo trì cho lập trình viên.', 'https://example.com/clean-code.jpg', 144, 19),
(1005, 'Sapiens: Lược sử loài người', 'Yuval Noah Harari', 'NXB Thế Giới', 179000, 10, 'AVAILABLE', 'Khám phá lịch sử phát triển của loài người qua góc nhìn khoa học và xã hội.', 'https://example.com/sapiens.jpg', 131, 12),
(1006, 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'NXB Kim Đồng', 65000, 25, 'AVAILABLE', 'Tác phẩm kinh điển của văn học Việt Nam, giàu tính phiêu lưu và giáo dục.', 'https://example.com/de-men-phieu-luu-ky.jpg', 101, 1),
(1007, 'One Piece Tập 1', 'Eiichiro Oda', 'NXB Kim Đồng', 24000, 40, 'AVAILABLE', 'Mở đầu hành trình hải tặc đầy hấp dẫn, hài hước và phiêu lưu.', 'https://example.com/one-piece-1.jpg', 134, 14),
(1008, 'Tư Duy Nhanh Và Chậm', 'Daniel Kahneman', 'NXB Trẻ', 145000, 14, 'AVAILABLE', 'Sách nổi tiếng về hai hệ thống tư duy và cách con người ra quyết định.', 'https://example.com/tu-duy-nhanh-va-cham.jpg', 151, 22),
(1009, 'Cơ Thể Người', 'Nhiều tác giả', 'NXB Giáo Dục', 110000, 16, 'AVAILABLE', 'Kiến thức cơ bản về giải phẫu và hoạt động của cơ thể người.', 'https://example.com/co-the-nguoi.jpg', 147, 20),
(1010, 'Bóng Đá Hiện Đại', 'Nhiều tác giả', 'NXB Thể Thao', 90000, 22, 'AVAILABLE', 'Tổng hợp chiến thuật, kỹ năng và tư duy thi đấu trong bóng đá hiện đại.', 'https://example.com/bong-da-hien-dai.jpg', 156, 24)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('books', 'id'), coalesce(max(id), 1), max(id) IS NOT NULL) FROM books;
