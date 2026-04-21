export interface AddToCartRequest {
  userId?: number;
  bookId: number;
  quantity: number;
}

export interface CartMutationRequest {
  userId: number;
  bookId: number;
  quantity: number;
}

export interface ApiError {
  status?: number;
  message?: string;
  retryAfter?: string | number | null;
}

export interface CartItem {
  id: number;
  cartId?: number;
  bookId: number;
  quantity: number;
}

export interface CartResponse {
  id: number | null;
  userId: number | null;
  totalEstimated?: string | number;
  items: CartItem[];
}
