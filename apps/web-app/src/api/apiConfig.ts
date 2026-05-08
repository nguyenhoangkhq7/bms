// src/api/apiConfig.ts

export const BASE_URL = 'http://localhost/api/v1/products/api/books'; // Nhớ đổi port nếu backend chạy port khác

// Hàm dùng chung để xử lý lỗi và convert data sang JSON
export const handleResponse = async <T>(response: Response): Promise<T | null> => {
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
            // Thử parse errorText dưới dạng JSON
            const errJson = JSON.parse(errorText);
            errorMessage = errJson.message || errJson.error || errorText;
        } catch (e) {
            // Không phải JSON, bỏ qua
        }
        throw new Error(errorMessage || 'Lỗi khi gọi API!');
    }
    
    // Đọc text trước để kiểm tra body có rỗng không
    const text = await response.text();
    if (!text) {
        return null; // Trả về null nếu body rỗng (thường gặp ở DELETE trả về 200 OK hoặc 204 No Content)
    }
    
    return JSON.parse(text) as T;
};