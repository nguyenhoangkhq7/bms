"use client"

import React from 'react'

type Props = {
  label?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export default function AddToCartButton({
  label = 'Add to cart',
  onClick,
  disabled = false,
  loading = false,
}: Props) {
  return (
    <button
      aria-label="Add to cart"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-3 text-white shadow-lg transition ${
        disabled || loading ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:opacity-95'
      }`}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
      <span className="text-lg font-semibold">{loading ? 'Adding...' : label}</span>
    </button>
  )
}
