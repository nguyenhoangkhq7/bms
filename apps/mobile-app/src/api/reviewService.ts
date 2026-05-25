import { productHttp } from "./productClient";
import type { Review } from "../types";

export const reviewService = {
  getReviewsOfBook: async (bookId: number): Promise<Review[]> => {
    const response = await productHttp.get<Review[]>(
      `/api/books/${bookId}/reviews`,
    );
    return response.data ?? [];
  },
};
