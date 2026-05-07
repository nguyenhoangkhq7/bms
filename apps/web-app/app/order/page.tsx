"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PackageCheck, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import { getEffectiveUserId } from '@/src/modules/cart/utils/userContext'
import { getCart } from '@/src/modules/cart/services/cartService'
import { bookService } from '@/src/api/bookService'
import { previewCheckout, submitCheckout } from '@/src/modules/checkout/services/checkoutService'
import type { CheckoutPreviewResponse, CheckoutRequest } from '@/src/modules/checkout/types'
import type { CartResponse } from '@/src/modules/cart/types'
import type { Book } from '@/src/types'
import type { AddressPickerProps } from '@/src/modules/checkout/components/AddressPicker'

type BookMap = Record<number, Book | null>

const STORE_COORDS = { lat: 10.822159, lng: 106.686824 }

const AddressPicker = dynamic<AddressPickerProps>(
  () => import('@/src/modules/checkout/components/AddressPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
        Dang tai ban do...
      </div>
    ),
  }
)

export default function OrderPage() {
  const router = useRouter()
  const [loadingCart, setLoadingCart] = useState(true)
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [booksById, setBooksById] = useState<BookMap>({})

  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState<number | null>(STORE_COORDS.lat)
  const [longitude, setLongitude] = useState<number | null>(STORE_COORDS.lng)
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const [voucherCode, setVoucherCode] = useState('')
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const previewRequestId = useRef(0)

  const formattedCurrency = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }),
    []
  )

  async function hydrateBookDetails(nextCart: CartResponse | null) {
    const ids = Array.from(new Set((nextCart?.items ?? []).map((item) => item.bookId)))
    const missingIds = ids.filter((id) => booksById[id] === undefined)

    if (missingIds.length === 0) {
      return
    }

    const results = await Promise.all(
      missingIds.map(async (id) => {
        try {
          const book = await bookService.getBookById(id)
          return [id, book] as const
        } catch {
          return [id, null] as const
        }
      })
    )

    setBooksById((prev) => {
      const merged: BookMap = { ...prev }
      for (const [id, book] of results) {
        merged[id] = book
      }
      return merged
    })
  }

  async function fetchCartData() {
    setLoadingCart(true)
    try {
      const userId = getEffectiveUserId()
      const data = await getCart(userId)
      setCart(data)
      await hydrateBookDetails(data)
    } catch (e: any) {
      toast.error(e?.message ?? 'Khong the tai gio hang')
    } finally {
      setLoadingCart(false)
    }
  }

  useEffect(() => {
    fetchCartData()
  }, [])

  const computedSubtotal = (cart?.items ?? []).reduce((sum, item) => {
    const price = Number(booksById[item.bookId]?.price ?? 0)
    return sum + price * item.quantity
  }, 0)

  const subtotalAmount = preview?.subtotalAmount ?? computedSubtotal
  const baseShippingFee = preview?.baseShippingFee ?? 0
  const shippingDiscount = preview?.shippingDiscount ?? 0
  const orderDiscount = preview?.orderDiscount ?? 0
  const finalTotal = preview?.finalTotal ?? Math.max(subtotalAmount + baseShippingFee - shippingDiscount - orderDiscount, 0)

  const addressReady = address.trim().length > 0
  const coordsReady = typeof latitude === 'number' && typeof longitude === 'number'
  const canPreview = addressReady && coordsReady && hasSelectedLocation
  const canSubmit =
    mapReady &&
    canPreview &&
    !previewLoading &&
    !checkoutLoading &&
    !loadingCart &&
    (cart?.items?.length ?? 0) > 0

  useEffect(() => {
    if (!canPreview) {
      setPreview(null)
      return
    }

    const userId = getEffectiveUserId()
    if (!userId) return

    const currentId = ++previewRequestId.current
    const handler = window.setTimeout(async () => {
      const payload: CheckoutRequest = {
        userId,
        shippingAddress: address.trim(),
        shippingLatitude: latitude as number,
        shippingLongitude: longitude as number,
        voucherCode: voucherCode.trim() || undefined,
      }

      setPreviewLoading(true)
      try {
        const data = await previewCheckout(payload)
        if (previewRequestId.current === currentId) {
          setPreview(data)
        }
      } catch (e: any) {
        if (previewRequestId.current === currentId) {
          toast.error(e?.message ?? 'Khong the xem truoc don hang')
        }
      } finally {
        if (previewRequestId.current === currentId) {
          setPreviewLoading(false)
        }
      }
    }, 500)

    return () => window.clearTimeout(handler)
  }, [address, latitude, longitude, voucherCode, canPreview])

  async function handleCheckout() {
    const userId = getEffectiveUserId()
    if (!userId) {
      toast.error('Khong tim thay userId')
      return
    }

    if (!canPreview) {
      toast.error('Vui long chon dia chi giao hang hop le')
      return
    }

    const payload: CheckoutRequest = {
      userId,
      shippingAddress: address.trim(),
      shippingLatitude: latitude as number,
      shippingLongitude: longitude as number,
      voucherCode: voucherCode.trim() || undefined,
    }

    setCheckoutLoading(true)
    try {
      const data = await submitCheckout(payload)
      toast.success(`Dat hang thanh cong #${data.id}`)
      router.push('/order/thank-you')
    } catch (e: any) {
      toast.error(e?.message ?? 'Thanh toan that bai')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_top,_#fff2d7_0%,_#f8fafc_45%,_#eef2f7_100%)] px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Order</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Xac nhan dia chi va thanh toan
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Chon vi tri giao hang de tinh phi ship chinh xac tu IUH.
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            <ArrowLeft size={16} />
            Ve gio hang
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif' }}>
                  San pham trong gio
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {(cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)} mon
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {loadingCart && <p>Dang tai gio hang...</p>}
                {!loadingCart && (cart?.items?.length ?? 0) === 0 && (
                  <p className="text-sm text-slate-500">Gio hang dang trong.</p>
                )}
                {(cart?.items ?? []).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {booksById[item.bookId]?.title ?? `Sach #${item.bookId}`}
                      </p>
                      <p className="text-xs text-slate-500">So luong: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formattedCurrency.format(
                        Number(booksById[item.bookId]?.price ?? 0) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e7dfd1] bg-white/80 p-6 shadow-[0_18px_40px_rgba(106,78,32,0.12)] backdrop-blur">
              <AddressPicker
                address={address}
                latitude={latitude}
                longitude={longitude}
                onAddressChange={setAddress}
                onLocationChange={({ lat, lng }) => {
                  setLatitude(lat)
                  setLongitude(lng)
                }}
                onLocationSelected={setHasSelectedLocation}
                onReadyChange={setMapReady}
              />

              <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <Sparkles size={16} />
                  Voucher
                </div>
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    value={voucherCode}
                    onChange={(event) => setVoucherCode(event.target.value)}
                    placeholder="Nhap ma giam gia (FREE_SHIPPING)"
                    className="w-full rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-xs text-amber-700">
                    Ma FREE_SHIPPING se tru vao phi ship neu hop le.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif' }}>
                Chi tiet thanh toan
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Tien sach</span>
                  <span className="font-semibold text-slate-900">{formattedCurrency.format(subtotalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phi ship goc</span>
                  <span className="font-semibold text-slate-900">{formattedCurrency.format(baseShippingFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giam phi ship</span>
                  <span className="font-semibold text-emerald-600">-{formattedCurrency.format(shippingDiscount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giam gia don</span>
                  <span className="font-semibold text-emerald-600">-{formattedCurrency.format(orderDiscount)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-base font-semibold text-slate-900">
                  <span>Tong thanh toan</span>
                  <span>{formattedCurrency.format(finalTotal)}</span>
                </div>
                {previewLoading && <p className="text-xs text-slate-500">Dang cap nhat phi ship...</p>}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!canSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <PackageCheck size={18} />
                  {checkoutLoading ? 'Dang xu ly...' : 'Dat hang'}
                </button>
                {!mapReady && (
                  <p className="text-xs text-amber-600">Ban do chua san sang. Vui long doi tai ban do.</p>
                )}
                {mapReady && !hasSelectedLocation && (
                  <p className="text-xs text-amber-600">Vui long chon dia chi tren ban do de tinh phi ship.</p>
                )}
                {previewLoading && (
                  <p className="text-xs text-amber-600">Dang tinh phi ship. Vui long doi mot chut.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
