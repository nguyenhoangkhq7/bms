// src/api/bookService.ts
import { BASE_URL, HYBRID_SEARCH_URL, handleResponse } from './apiConfig';
import type { Book, BookCreateRequest, BookUpdateRequest } from '@/src/types';

export const bookService = {
    getAllBooks: async (): Promise<Book[]> => {
        const response = await fetch(BASE_URL);
        return (await handleResponse<Book[]>(response)) ?? [];
    },

    getBookById: async (id: number): Promise<Book | null> => {
        const response = await fetch(`${BASE_URL}/${id}`);
        return await handleResponse<Book>(response);
    },

    createBook: async (bookData: BookCreateRequest): Promise<Book | null> => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData),
        });
        return await handleResponse<Book>(response);
    },

    updateBook: async (id: number, bookData: BookUpdateRequest): Promise<Book | null> => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData),
        });
        return await handleResponse<Book>(response);
    },

    deleteBook: async (id: number): Promise<null> => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        return await handleResponse<null>(response);
    },

    hybridSearchBooks: async (
        query: string,
        limit = 10,
        offset = 0,
        options?: {
            categoryIdsCsv?: string;
            minPrice?: string;
            maxPrice?: string;
        }
    ): Promise<Book[]> => {
        const url = new URL(HYBRID_SEARCH_URL);
        url.searchParams.set('query', query);
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('offset', String(offset));
        if (options?.categoryIdsCsv) {
            url.searchParams.set('categoryIdsCsv', options.categoryIdsCsv);
        }
        if (options?.minPrice) {
            url.searchParams.set('minPrice', options.minPrice);
        }
        if (options?.maxPrice) {
            url.searchParams.set('maxPrice', options.maxPrice);
        }

        const response = await fetch(url.toString());
        return (await handleResponse<Book[]>(response)) ?? [];
    }
};
