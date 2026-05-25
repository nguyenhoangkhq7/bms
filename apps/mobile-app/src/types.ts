// src/types.ts
// Shared types synced with web app

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  price: number;
  description: string;
  categoryId: number;
  category?: Category;
  images?: BookImage[];
  reviews?: Review[];
  imageUrl?: string;
  secondaryImages?: BookImage[];
  stockQuantity?: number;
  status?: string;
  rating?: number;
  originalPrice?: string;
  image?: string;
  isDeleted?: boolean;
  parentCategoryId?: number;
  [key: string]: unknown;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  subCategories?: Category[];
}

export interface Review {
  id: number;
  bookId?: number;
  userName: string;
  userId?: number;
  content: string;
  rating: number;
  mediaUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BookImage {
  id: number;
  bookId: number;
  imageUrl: string;
}

export interface WishlistItem {
  bookId: number;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
  addedAt: string;
}
