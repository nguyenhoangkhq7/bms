import axios from 'axios'
import type { CheckoutRequest, CheckoutPreviewResponse, CheckoutResponse } from '@/src/checkout/types'

const configuredBase = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || process.env.BACKEND_API_BASE_URL
const BACKEND_BASE_CANDIDATES = configuredBase
  ? [configuredBase]
  : ['http://localhost/api/v1/orders', '/api/v1/orders', 'http://localhost:8083']

const RETRYABLE_ERRORS = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'])
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function postWithRetry(url: string, body: any, headers: Record<string, string>) {
  let lastError: any = null
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await axios.post(url, body, { headers })
    } catch (err: any) {
      lastError = err
      const isRetryable = !err.response && RETRYABLE_ERRORS.has(err.code)
      if (!isRetryable || attempt === 3) {
        throw err
      }
      await delay(400 * attempt)
    }
  }
  throw lastError
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function previewOrder(payload: CheckoutRequest): Promise<CheckoutPreviewResponse> {
  let lastError: any = null
  const headers = getAuthHeaders()

  for (let i = 0; i < BACKEND_BASE_CANDIDATES.length; i++) {
    const base = BACKEND_BASE_CANDIDATES[i]
    try {
      const res = await postWithRetry(`${base}/api/orders/preview`, payload, headers)
      return res.data
    } catch (err: any) {
      lastError = err
      const isLast = i === BACKEND_BASE_CANDIDATES.length - 1
      if (err.response?.status === 404 && !isLast) continue
      if (err.response) throw err
    }
  }
  throw lastError
}

export async function submitOrder(payload: CheckoutRequest): Promise<CheckoutResponse> {
  let lastError: any = null
  const headers = getAuthHeaders()

  for (let i = 0; i < BACKEND_BASE_CANDIDATES.length; i++) {
    const base = BACKEND_BASE_CANDIDATES[i]
    try {
      const res = await postWithRetry(`${base}/api/orders`, payload, headers)
      return res.data
    } catch (err: any) {
      lastError = err
      const isLast = i === BACKEND_BASE_CANDIDATES.length - 1
      if (err.response?.status === 404 && !isLast) continue
      if (err.response) throw err
    }
  }
  throw lastError
}
