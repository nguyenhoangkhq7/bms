"use client"

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { addItem } from '../services/cartService'
import type { ApiError, AddToCartRequest } from '../types'

export function useAddToCart() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  async function addToCart(payload: AddToCartRequest) {
    setLoading(true)
    setError(null)
    try {
      const data = await addItem(payload)
      toast.success('Đã thêm vào giỏ hàng')
      return data
    } catch (err: any) {
      const status = err?.status
      const retryAfter = err?.retryAfter
      const message = err?.message ?? 'Lỗi'
      setError({ status, message, retryAfter })
      if (status === 429) {
        toast.error('Bạn thao tác quá nhanh, vui lòng đợi một lát.')
      } else {
        toast.error(message)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { addToCart, loading, error }
}
