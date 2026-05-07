import axios from 'axios'
import type { CheckoutRequest, CheckoutPreviewResponse, CheckoutResponse } from '@/src/modules/checkout/types'

function resolveOrderBase() {
  if (typeof window === 'undefined') {
    return '/api/v1/orders'
  }

  const { protocol, hostname, port, origin } = window.location
  if (port && port !== '80' && port !== '443') {
    if (port === '3000') {
      return `${protocol}//${hostname}/api/v1/orders`
    }
  }

  return `${origin}/api/v1/orders`
}

const ORDER_SERVICE_BASE = resolveOrderBase()
const PREVIEW_ENDPOINT = `${ORDER_SERVICE_BASE}/preview`
const CHECKOUT_ENDPOINT = `${ORDER_SERVICE_BASE}`

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

function toClientError(e: any) {
  if (e.response) {
    const retryAfter = e.response.headers?.['retry-after'] ?? e.response.data?.retryAfter
    const message = e.response.data?.message ?? e.response.data?.error ?? 'Loi server'
    const err: any = new Error(message)
    err.status = e.response.status
    err.retryAfter = retryAfter
    return err
  }
  return e
}

export async function previewOrder(payload: CheckoutRequest): Promise<CheckoutPreviewResponse> {
  try {
    const headers = getAuthHeaders()
    const res = await axios.post(PREVIEW_ENDPOINT, payload, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}

export async function submitOrder(payload: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    const headers = getAuthHeaders()
    const res = await axios.post(CHECKOUT_ENDPOINT, payload, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}
