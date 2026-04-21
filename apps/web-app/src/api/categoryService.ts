// src/api/categoryService.ts
import { handleResponse } from './apiConfig'; // Tái sử dụng apiConfig
import type { Category } from '@/src/types';

// Giả định backend có endpoint: GET /api/categories
// Đổi lại URL thực tế nếu endpoint của bạn khác.
const CATEGORY_API_URL = 'http://localhost/api/v1/products/categories';

export const categoryService = {
    getAllCategories: async (): Promise<Category[]> => {
        const response = await fetch(CATEGORY_API_URL);
        return (await handleResponse<Category[]>(response)) ?? [];
    }
};