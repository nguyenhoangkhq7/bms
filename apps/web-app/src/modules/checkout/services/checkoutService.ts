import axios from 'axios'
import type { CheckoutRequest, CheckoutPreviewResponse, CheckoutResponse } from '../types'

const PREVIEW_ENDPOINT = '/api/checkout/preview'
const CHECKOUT_ENDPOINT = '/api/checkout/submit'

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

function toClientError(e: any) {
  if (e.response) {
    const retryAfter = e.response.headers?.['retry-after'] ?? e.response.data?.retryAfter
    const message = e.response.data?.message ?? e.response.data?.error ?? 'Lỗi server'
    const err: any = new Error(message)
    err.status = e.response.status
    err.retryAfter = retryAfter
    return err
  }
  return e
}

export async function previewCheckout(payload: CheckoutRequest): Promise<CheckoutPreviewResponse> {
  try {
    const headers = getAuthHeaders()
    const res = await axios.post(PREVIEW_ENDPOINT, payload, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}

export async function submitCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    const headers = getAuthHeaders()
    const res = await axios.post(CHECKOUT_ENDPOINT, payload, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}
