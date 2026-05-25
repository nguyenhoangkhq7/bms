// src/wishlist/types.ts

export interface WishlistItem {
  bookId: number;
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
  addedAt: string; // ISO date string
}
