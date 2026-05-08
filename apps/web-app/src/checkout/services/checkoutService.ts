import type { CheckoutRequest, CheckoutPreviewResponse, CheckoutResponse } from '../types'
import { previewOrder, submitOrder } from '@/src/api/checkoutService'

export async function previewCheckout(payload: CheckoutRequest): Promise<CheckoutPreviewResponse> {
  return previewOrder(payload)
}

export async function submitCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  return submitOrder(payload)
}
