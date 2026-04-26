"use client"

import React from 'react'
import AddToCartButton from './AddToCartButton'
import { useAddToCart } from '../hooks/useAddToCart'
import type { AddToCartRequest } from '../types'

type Props = {
  bookId: number
  quantity?: number
  userId?: number
}

export default function AddToCartContainer({ bookId, quantity = 1, userId }: Props) {
  const { addToCart, loading } = useAddToCart()

  async function handleAdd() {
    const payload: AddToCartRequest = { userId, bookId, quantity }
    if (!payload.userId && typeof window !== 'undefined') {
      const u = localStorage.getItem('userId')
      if (u) payload.userId = Number(u)
    }
    try {
      await addToCart(payload)
    } catch (e) {
      // handled in hook
    }
  }

  return <AddToCartButton onClick={handleAdd} disabled={loading} loading={loading} />
}
