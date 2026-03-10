# Bookstore Management System (BMS)

Hệ thống quản lý hiệu sách sử dụng kiến trúc Microservices.

## 📂 Cấu trúc dự án

Dự án được phân chia thư mục rõ ràng:

- `apps/`: Chứa mã nguồn ứng dụng tương tác với người dùng (Web App, Mobile App).
- `services/`: Chứa mã nguồn các Backend API Services (viết bằng ngôn ngữ Java/Spring Boot).
  - `identity-service`: Quản lý danh tính và cấp quyền.
  - `product-service`: Quản lý danh mục và thông tin sách.
  - `order-service`: Xử lý đơn hàng và giỏ hàng.
  - `promotion-service`: Quản lý các chiến dịch khuyến mãi, mã giảm giá.
  - `report-service`: Xử lý thống kê và báo cáo hệ thống.
- `gateway/`: API Gateway dựa trên Nginx giúp định tuyến (routing) request từ phía ngoài đến đúng service cần thiết.

## 🛠 Yêu cầu hệ thống

Các thành viên trong nhóm cần cài đặt những công cụ sau trên máy cá nhân để phát triển thuận lợi:

- [Docker](https://www.docker.com/products/docker-desktop) và Docker Compose.
- [Java Development Kit (JDK) 21](https://adoptium.net/en-GB/temurin/releases/?version=21).
- [Node.js](https://nodejs.org/) (Phiên bản v20 trở lên).

## 🚀 Hướng dẫn cài đặt và thiết lập dự án

1. **Clone mã nguồn về máy**

   ```bash
   git clone <REPO_URL>
   cd bms
   ```

2. **Cấu hình môi trường**
   Copy nội dung từ file mẫu để tạo file `.env` chạy cục bộ.

   ```bash
   cp .env.example .env
   ```

   _(Bạn có thể chỉnh sửa lại mật khẩu database nếu cần thiết ở file `.env`)_

3. **Chạy toàn bộ hệ thống bằng Docker**
   Để chạy tất cả dịch vụ cùng một lúc, sử dụng lệnh sau ở thư mục gốc:

   ```bash
   docker-compose up -d --build
   ```

   Lệnh trên sẽ tự động build các image (`Dockerfile`) cho từng vi dịch vụ và start tất cả `container` (bao gồm cả database server).

   Để dập tắt hệ thống an toàn:

   ```bash
   docker-compose down
   ```

## 👥 Quy trình làm việc nhóm (Git Workflow)

Để hạn chế conflict code và giúp codebase luôn sạch sẽ, các thành viên tuân thủ các bước:

1. **Lấy code mới nhất**: Trước khi code, luôn Pull code mới nhất từ nhánh chính (`main` hoặc `develop`).
2. **Tạo nhánh mới (Branching)**: Không code trực tiếp lên nhánh chính.
   - Feature mới: `feature/ten-tinh-nang` (VD: `feature/create-order-api`).
   - Sửa lỗi: `bugfix/ten-loi` (VD: `bugfix/fix-login-error`).
3. **Commit Code**: Viết commit message rõ ràng về việc bạn đã làm gì.
4. **Tạo Pull Request (PR)**: Đẩy nhánh phụ lên kho lưu trữ và tạo Pull Request vào nhánh chính. Bạn cần chờ CI (GitHub Actions) chạy test pass và nhờ một thành viên nhóm Review Code thì mới Merge.

---

_Chúc team phát triển dự án thành công!_
