import { productHttp } from "./productClient";
import type { Book } from "../types";

export const bookService = {
  getAllBooks: async (): Promise<Book[]> => {
    const response = await productHttp.get<Book[]>("/api/books");
    return response.data ?? [];
  },

  getBookById: async (id: number): Promise<Book | null> => {
    const response = await productHttp.get<Book>(`/api/books/${id}`);
    return response.data ?? null;
  },

  hybridSearchBooks: async (
    query: string,
    limit = 10,
    offset = 0,
    options?: {
      categoryIdsCsv?: string;
      minPrice?: string;
      maxPrice?: string;
    },
  ): Promise<Book[]> => {
    const params: Record<string, string> = {
      query,
      limit: String(limit),
      offset: String(offset),
    };
    if (options?.categoryIdsCsv) params.categoryIdsCsv = options.categoryIdsCsv;
    if (options?.minPrice) params.minPrice = options.minPrice;
    if (options?.maxPrice) params.maxPrice = options.maxPrice;

    const response = await productHttp.get<Book[]>(
      "/api/v1/books/hybrid-search",
      { params },
    );
    return response.data ?? [];
  },
};
