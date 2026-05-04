"use client"

import React from 'react'
import AddToCartButton from './AddToCartButton'
import { useAddToCart } from '../hooks/useAddToCart'
import type { AddToCartRequest } from '../types'
import { useAuth } from '@/src/auth/context'
import toast from 'react-hot-toast'

type Props = {
  bookId: number
  quantity?: number
}

export default function AddToCartContainer({ bookId, quantity = 1 }: Props) {
  const { addToCart, loading } = useAddToCart()
  const { user } = useAuth()

  async function handleAdd() {
    if (!user) {
      toast.error('Please login to add to cart')
      return
    }
    
    const payload: AddToCartRequest = { userId: user.id, bookId, quantity }
    try {
      await addToCart(payload)
      toast.success('Added to cart successfully')
    } catch (e) {
      // handled in hook
    }
  }

  return <AddToCartButton onClick={handleAdd} disabled={loading} loading={loading} />
}
