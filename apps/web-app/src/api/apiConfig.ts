// src/api/apiConfig.ts

export const BASE_URL = 'http://localhost/api/v1/products/api/books'; // Nhớ đổi port nếu backend chạy port khác

// Hàm dùng chung để xử lý lỗi và convert data sang JSON
export const handleResponse = async <T>(response: Response): Promise<T | null> => {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Lỗi khi gọi API!');
    }
    // Trạng thái 204 (No Content) thường dùng cho hàm DELETE
    if (response.status === 204) return null;
    return response.json() as Promise<T>;
};