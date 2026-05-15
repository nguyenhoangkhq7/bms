// src/api/bookImageService.ts
import { BASE_URL, handleResponse } from './apiConfig';
import type { BookImage } from '@/src/types';

export const bookImageService = {
    // GET /api/books/{bookId}/images
    getImagesByBookId: async (bookId: number): Promise<BookImage[]> => {
        const response = await fetch(`${BASE_URL}/${bookId}/images`);
        return (await handleResponse<BookImage[]>(response)) ?? [];
    },

    // POST /api/upload
    uploadImage: async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use the products gateway mapping or absolute URL. 
        // Assuming BASE_URL is something like http://localhost/api/v1/products/api/books
        // So the upload URL is http://localhost/api/v1/products/api/upload
        const uploadUrl = BASE_URL.replace('/api/books', '/api/upload');
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });
        const data = await handleResponse<{ url: string }>(response);
        return data ? data.url : null;
    },

    // POST /api/books/{bookId}/images
    addImageToBook: async (bookId: number, imageUrl: string): Promise<BookImage | null> => {
        const response = await fetch(`${BASE_URL}/${bookId}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
        });
        return await handleResponse<BookImage>(response);
    },

    // DELETE /api/books/images/{imageId}
    deleteImage: async (imageId: number): Promise<null> => {
        const response = await fetch(`${BASE_URL}/images/${imageId}`, {
            method: 'DELETE',
        });
        return await handleResponse<null>(response);
    }
};
