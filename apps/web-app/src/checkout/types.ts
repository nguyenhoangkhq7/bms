export interface CheckoutRequest {
  userId: number;
  shippingAddressId?: number;
  shippingAddress?: string;
  shippingLatitude?: number;
  shippingLongitude?: number;
  voucherCode?: string;
  items?: Array<{ bookId: number; quantity: number }>;
}

export interface ShippingAddress {
  id: number;
  userId: number;
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface ShippingAddressRequest {
  userId: number;
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface CheckoutPreviewResponse {
  subtotalAmount: number;
  baseShippingFee: number;
  shippingDiscount: number;
  orderDiscount: number;
  finalTotal: number;
  totalAmount?: number;
}

export interface CheckoutResponse extends CheckoutPreviewResponse {
  id: number;
  status: string;
}

export interface ApiError {
  status?: number;
  message?: string;
  retryAfter?: string | number | null;
}
