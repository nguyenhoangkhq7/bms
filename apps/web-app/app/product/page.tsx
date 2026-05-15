"use client"

import React from 'react'
import { AddToCartContainer } from '@/src/cart'

export default function ProductPage() {
  const book = { id: 101, title: 'Demo Book', author: 'Author', price: 25 }

  return (
    <main className="min-h-screen bg-[#f3f3f0] px-6 py-10">
      <div className="mx-auto max-w-6xl rounded-2xl border border-[#d3d3cf] bg-white p-8 shadow-sm">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">Product Detail</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr]">
          <div className="flex h-[380px] items-center justify-center rounded-xl bg-gradient-to-b from-gray-200 to-gray-300">
            <span className="text-lg font-medium text-gray-600">Book Cover</span>
          </div>

          <section>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Featured</p>
            <h2 className="mt-1 text-4xl font-semibold">{book.title}</h2>
            <p className="mt-3 text-lg text-gray-600">by {book.author}</p>
            <p className="mt-6 text-3xl font-bold text-gray-900">${book.price}</p>

            <div className="mt-8 w-fit">
              <AddToCartContainer bookId={book.id} />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
