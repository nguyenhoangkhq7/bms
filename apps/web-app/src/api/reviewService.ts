// src/api/reviewService.ts
import { BASE_URL, handleResponse } from './apiConfig';
import type { Review, ReviewCreateRequest } from '@/src/types';

export const reviewService = {
    getReviewsOfBook: async (bookId: number): Promise<Review[]> => {
        const response = await fetch(`${BASE_URL}/${bookId}/reviews`);
        return (await handleResponse<Review[]>(response)) ?? [];
    },

    addReviewToBook: async (bookId: number, reviewData: ReviewCreateRequest): Promise<Review | null> => {
        const response = await fetch(`${BASE_URL}/${bookId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData),
        });
        return await handleResponse<Review>(response);
    },

    deleteReview: async (reviewId: number): Promise<null> => {
        // Backend của bạn dùng /api/books/reviews/{reviewId} để xóa
        const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
        });
        return await handleResponse<null>(response);
    }
};