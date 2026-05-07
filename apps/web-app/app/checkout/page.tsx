"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getEffectiveUserId } from '@/src/modules/cart/utils/userContext'
import { previewCheckout, submitCheckout } from '@/src/modules/checkout/services/checkoutService'
import type { CheckoutPreviewResponse, CheckoutRequest } from '@/src/modules/checkout/types'

const DEFAULT_LAT = 10.822159
const DEFAULT_LNG = 106.686824

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingLatitude, setShippingLatitude] = useState(String(DEFAULT_LAT))
  const [shippingLongitude, setShippingLongitude] = useState(String(DEFAULT_LNG))

  const formattedCurrency = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }),
    []
  )

  function parseNumber(value: string) {
    const num = Number.parseFloat(value)
    return Number.isFinite(num) ? num : null
  }

  async function handlePreview() {
    const userId = getEffectiveUserId()
    if (!userId) {
      toast.error('Không tìm thấy userId')
      return
    }

    const lat = parseNumber(shippingLatitude)
    const lng = parseNumber(shippingLongitude)

    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    if (lat === null || lng === null) {
      toast.error('Toạ độ giao hàng chưa hợp lệ')
      return
    }

    const payload: CheckoutRequest = {
      userId,
      shippingAddress: shippingAddress.trim(),
      shippingLatitude: lat,
      shippingLongitude: lng,
      voucherCode: voucherCode.trim() || undefined,
    }

    setLoading(true)
    try {
      const data = await previewCheckout(payload)
      setPreview(data)
    } catch (e: any) {
      toast.error(e?.message ?? 'Không thể xem trước đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout() {
    const userId = getEffectiveUserId()
    if (!userId) {
      toast.error('Không tìm thấy userId')
      return
    }

    const lat = parseNumber(shippingLatitude)
    const lng = parseNumber(shippingLongitude)

    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    if (lat === null || lng === null) {
      toast.error('Toạ độ giao hàng chưa hợp lệ')
      return
    }

    const payload: CheckoutRequest = {
      userId,
      shippingAddress: shippingAddress.trim(),
      shippingLatitude: lat,
      shippingLongitude: lng,
      voucherCode: voucherCode.trim() || undefined,
    }

    setLoading(true)
    try {
      const data = await submitCheckout(payload)
      toast.success(`Đặt hàng thành công #${data.id}`)
      setPreview(data)
    } catch (e: any) {
      toast.error(e?.message ?? 'Thanh toán thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_top,_#fff2d7_0%,_#f8fafc_45%,_#eef2f7_100%)] px-4 py-8 sm:px-8">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-[#e7dfd1] bg-white/80 p-6 shadow-[0_18px_40px_rgba(106,78,32,0.12)] backdrop-blur">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#a28354]">Checkout</p>
              <h1
                className="mt-2 text-3xl font-semibold text-slate-900"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Hoan tat don hang
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Xem truoc hoa don, ap dung voucher, va chot thanh toan ngay.
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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Dia chi giao hang
                </label>
                <input
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  placeholder="So nha, duong, quan/huyen..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Vi do
                  </label>
                  <input
                    value={shippingLatitude}
                    onChange={(event) => setShippingLatitude(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Kinh do
                  </label>
                  <input
                    value={shippingLongitude}
                    onChange={(event) => setShippingLongitude(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <Sparkles size={16} />
                  Voucher
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={voucherCode}
                    onChange={(event) => setVoucherCode(event.target.value)}
                    placeholder="Nhap ma giam gia"
                    className="w-full flex-1 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={loading}
                    className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Ap dung
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2
                className="text-lg font-semibold text-slate-900"
                style={{ fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif' }}
              >
                Hoa don tam tinh
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Tien sach</span>
                  <span className="font-semibold text-slate-900">
                    {formattedCurrency.format(preview?.subtotalAmount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phi van chuyen</span>
                  <span className="font-semibold text-slate-900">
                    {formattedCurrency.format(preview?.baseShippingFee ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giam phi ship</span>
                  <span className="font-semibold text-emerald-600">
                    -{formattedCurrency.format(preview?.shippingDiscount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giam gia don</span>
                  <span className="font-semibold text-emerald-600">
                    -{formattedCurrency.format(preview?.orderDiscount ?? 0)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-base font-semibold text-slate-900">
                  <span>Tong thanh toan</span>
                  <span>{formattedCurrency.format(preview?.finalTotal ?? 0)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={loading}
                  className="w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Xem truoc
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Dang xu ly...' : 'Tien hanh thanh toan'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#101820] via-[#1f2937] to-[#2b3546] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200">Tong quan</div>
          <h3 className="mt-2 text-2xl font-semibold" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Chot thanh toan
          </h3>
          <p className="mt-3 text-sm text-slate-200">
            He thong se tu dong lay san pham trong gio hang hien tai. Ban co the ap dung voucher
            va kiem tra tong thanh toan truoc khi dat hang.
          </p>
          <div className="mt-6 space-y-3 rounded-2xl bg-white/10 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Voucher</span>
              <span className="font-semibold text-white">{voucherCode || 'Chua ap dung'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Trang thai</span>
              <span className="font-semibold text-emerald-300">
                {preview ? 'San sang' : 'Can xem truoc'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
