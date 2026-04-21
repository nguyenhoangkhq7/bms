"use client"

import React, { useEffect, useState } from 'react'
import { getCart, removeItem, updateQuantity } from '@/src/modules/cart/services/cartService'
import { toast } from 'react-hot-toast'
import type { CartResponse } from '@/src/modules/cart/types'

export default function CartPage() {
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [pendingBookId, setPendingBookId] = useState<number | null>(null)

  async function fetchCartData() {
    setLoading(true)
    try {
      const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : undefined
      const data = await getCart(userId || undefined)
      setCart(data)
    } catch (e: any) {
      toast.error(e?.message ?? 'Không thể tải giỏ hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartData()
  }, [])

  async function handleRemove(bookId: number, quantity: number) {
    const userId = Number(localStorage.getItem('userId'))
    if (!userId) {
      toast.error('Missing userId in localStorage')
      return
    }

    try {
      setPendingBookId(bookId)
      await removeItem({ userId, bookId, quantity })
      toast.success('Removed item from cart')
      await fetchCartData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Remove failed')
    } finally {
      setPendingBookId(null)
    }
  }

  async function handleUpdateQuantity(bookId: number, nextQuantity: number) {
    if (nextQuantity < 1) {
      return
    }

    const userId = Number(localStorage.getItem('userId'))
    if (!userId) {
      toast.error('Missing userId in localStorage')
      return
    }

    try {
      setPendingBookId(bookId)
      await updateQuantity({ userId, bookId, quantity: nextQuantity })
      await fetchCartData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Update quantity failed')
    } finally {
      setPendingBookId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f7fb_0%,_#edeff4_55%,_#e7e9ef_100%)] px-4 py-8 text-[#111827] md:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#d8dbe3] bg-white/90 shadow-[0_12px_45px_rgba(28,39,74,0.12)] backdrop-blur">
        <header className="border-b border-[#e7e9ef] bg-white/70 px-6 py-4 md:px-8">
          <div className="mx-auto flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight md:text-3xl">BookHaven</div>
            <nav className="flex gap-4 text-xs font-medium md:gap-8 md:text-base">
              <a href="/" className="text-[#334155] transition hover:text-black">Home</a>
              <a href="/books" className="text-[#334155] transition hover:text-black">Books</a>
              <a href="/cart" className="font-semibold text-black">Cart</a>
              <a href="/order-history" className="text-[#334155] transition hover:text-black">Order history</a>
              <a href="/logout" className="text-[#9ca3af] transition hover:text-[#6b7280]">Logout</a>
            </nav>
          </div>
        </header>

        <main className="px-5 py-7 md:px-8 md:py-10">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_350px]">
            <section className="rounded-2xl border border-[#e5e7ef] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] md:p-7">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold md:text-3xl">Your cart</h1>
                <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-medium text-[#3730a3]">
                  {cart?.items?.length ?? 0} items
                </span>
              </div>

              {loading && <p className="py-10 text-center text-[#6b7280]">Loading cart...</p>}
              {!loading && cart && cart.items.length === 0 && (
                <p className="rounded-xl border border-dashed border-[#cfd5e4] bg-[#f9fafc] py-10 text-center text-[#6b7280]">
                  Your cart is empty.
                </p>
              )}

              {!loading && cart && (
                <div className="space-y-4">
                  {cart.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-4 rounded-xl border border-[#edf0f6] bg-gradient-to-r from-white to-[#f8fafc] p-4 shadow-sm"
                    >
                      <div className="h-20 w-16 rounded-lg bg-gradient-to-br from-[#d8dce8] to-[#bcc3d8]" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-semibold">Book #{it.bookId}</p>
                        <p className="text-sm text-[#6b7280]">Premium paperback</p>

                        <div className="mt-3 inline-flex items-center rounded-full border border-[#d5d9e5] bg-white shadow-sm">
                          <button
                            className="px-3 py-1 text-sm font-semibold text-[#374151] disabled:opacity-40"
                            disabled={pendingBookId === it.bookId || it.quantity <= 1}
                            onClick={() => handleUpdateQuantity(it.bookId, it.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-3 text-sm font-semibold text-[#111827]">{it.quantity}</span>
                          <button
                            className="px-3 py-1 text-sm font-semibold text-[#374151] disabled:opacity-40"
                            disabled={pendingBookId === it.bookId}
                            onClick={() => handleUpdateQuantity(it.bookId, it.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        className="rounded-lg bg-[#1f2937] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#111827] disabled:opacity-60"
                        disabled={pendingBookId === it.bookId}
                        onClick={() => handleRemove(it.bookId, it.quantity)}
                      >
                        {pendingBookId === it.bookId ? 'Working...' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-[#e5e7ef] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
              <h2 className="mb-5 text-2xl font-semibold">Order summary</h2>

              <div className="space-y-3 text-base">
                <div className="flex justify-between text-[#4b5563]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#111827]">${cart?.totalEstimated ?? '0'}</span>
                </div>
                <div className="flex justify-between text-[#4b5563]">
                  <span>Tax</span>
                  <span className="font-medium text-[#111827]">$4</span>
                </div>
                <div className="flex justify-between text-[#4b5563]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#111827]">$5</span>
                </div>
              </div>

              <hr className="my-5 border-[#e5e7ef]" />

              <div className="mb-5 flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>${cart?.totalEstimated ?? '0'}</span>
              </div>

              <button className="w-full rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-95">
                Proceed to checkout
              </button>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
