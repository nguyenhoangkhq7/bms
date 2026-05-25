import { productHttp } from "./productClient";
import type { Category } from "../types";

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await productHttp.get<Category[]>("/categories");
    return response.data ?? [];
  },
};
