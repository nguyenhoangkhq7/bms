"use client"

import React, { useState } from 'react'
import { AddToCartContainer } from '@/src/modules/cart'
import { toast } from 'react-hot-toast'

export default function ProductPage() {
  const [userId, setUserId] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') ?? '' : ''))
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''))

  function saveAuth() {
    if (typeof window !== 'undefined') {
      if (userId) localStorage.setItem('userId', String(userId))
      if (token) localStorage.setItem('token', token)
      toast.success('Saved userId/token to localStorage')
    }
  }

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

            <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="mb-3 text-lg font-semibold">Auth for API test (localStorage)</h3>
              <div className="grid gap-3 md:grid-cols-[140px_1fr] md:items-center">
                <label className="text-sm font-medium text-gray-700">User ID</label>
                <input
                  className="rounded-md border border-gray-300 bg-white px-3 py-2"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 11"
                />
                <label className="text-sm font-medium text-gray-700">Bearer token</label>
                <input
                  className="rounded-md border border-gray-300 bg-white px-3 py-2"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="optional"
                />
              </div>
              <button onClick={saveAuth} className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white">Save credentials</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
