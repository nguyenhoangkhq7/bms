"use client"

import React from 'react'
import { AddToCartContainer } from '@/src/modules/cart'

export default function Page() {
  const book = { id: 100, title: 'Title', author: 'Author', price: 45 }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="flex gap-8 items-start">
        <div className="w-1/3 bg-gray-200 h-80 rounded-md flex items-center justify-center">
          <span className="text-gray-500">Image</span>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-600 mb-4">{book.author}</p>
          <p className="text-xl font-semibold mb-6">${book.price}</p>

          <div className="w-96">
            <AddToCartContainer bookId={book.id} />
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">Related books</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-4 bg-white rounded shadow text-center">Related 1</div>
          <div className="p-4 bg-white rounded shadow text-center">Related 2</div>
          <div className="p-4 bg-white rounded shadow text-center">Related 3</div>
        </div>
      </section>
    </main>
  )
}
