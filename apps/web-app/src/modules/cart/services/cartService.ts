import axios from 'axios'
import type { AddToCartRequest, CartMutationRequest } from '../types'

// Use Next.js API routes to proxy to backend (avoids CORS + handles auth)
const ADD_ENDPOINT = '/api/cart/add'
const GET_ENDPOINT = '/api/cart/get'
const REMOVE_ENDPOINT = '/api/cart/remove'
const UPDATE_QTY_ENDPOINT = '/api/cart/update-quantity'

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

export async function addItem(payload: AddToCartRequest) {
  try {
    const headers = getAuthHeaders()
    const res = await axios.post(ADD_ENDPOINT, payload, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}

export async function getCart(userId?: number) {
  try {
    const headers = getAuthHeaders()

    // prefer explicit userId; fallback to localStorage userId
    const uid = userId ?? (typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : undefined)
    if (!uid) {
      // no user context — return empty cart shape for client
      return { id: null, userId: null, totalEstimated: 0, items: [] }
    }

    const res = await axios.get(`${GET_ENDPOINT}?userId=${uid}`, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}

export async function removeItem(payload: CartMutationRequest) {
  try {
    const headers = getAuthHeaders()
    const res = await axios.post(REMOVE_ENDPOINT, payload, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}

export async function updateQuantity(payload: CartMutationRequest) {
  try {
    const headers = getAuthHeaders()
    const res = await axios.post(UPDATE_QTY_ENDPOINT, payload, { headers })
    return res.data
  } catch (e: any) {
    throw toClientError(e)
  }
}

