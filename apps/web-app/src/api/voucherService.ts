export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE";
export type VoucherStatus = "ACTIVE" | "EXPIRED" | "DISABLED" | "DELETED";

export interface Voucher {
  id: number;
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  maxDiscountAmount?: number | null;
  minOrderValue?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  usageLimit?: number | null;
  usedCount?: number | null;
  status: VoucherStatus;
  description?: string | null;
}

export interface VoucherPayload {
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  maxDiscountAmount?: number | null;
  minOrderValue?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  usageLimit?: number | null;
  status: VoucherStatus;
  description?: string | null;
}

const BASE_URL = "/api/v1/promotions/api/vouchers";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const voucherService = {
  getAll: () => request<Voucher[]>(BASE_URL),

  create: (payload: VoucherPayload) =>
    request<Voucher>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: VoucherPayload) =>
    request<Voucher>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: number, status: VoucherStatus) =>
    request<Voucher>(`${BASE_URL}/${id}/status?status=${status}`, {
      method: "PATCH",
    }),

  softDelete: (id: number) =>
    request<Voucher>(`${BASE_URL}/${id}`, {
      method: "DELETE",
    }),
};
