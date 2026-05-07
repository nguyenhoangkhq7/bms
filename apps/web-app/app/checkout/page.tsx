"use client"

import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, MapPin, Plus, Sparkles, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getEffectiveUserId } from '@/src/cart/utils/userContext'
import { previewCheckout, submitCheckout } from '@/src/checkout/services/checkoutService'
import type { CheckoutPreviewResponse, CheckoutRequest, ShippingAddress, ShippingAddressRequest } from '@/src/checkout/types'
import {
  createShippingAddress,
  deleteShippingAddress,
  getShippingAddresses,
  setDefaultShippingAddress,
  updateShippingAddress,
} from '@/src/api/shippingAddressService'
import { searchVietnamAddress } from '@/src/api/geocodingService'

const DEFAULT_LAT = 10.822159
const DEFAULT_LNG = 106.686824
const AddressMapPicker = dynamic(() => import('@/src/checkout/components/AddressMapPicker'), { ssr: false })

const emptyForm = {
  recipientName: '',
  phoneNumber: '',
  addressLine: '',
  latitude: String(DEFAULT_LAT),
  longitude: String(DEFAULT_LNG),
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null)
  const [voucherCode, setVoucherCode] = useState('')

  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [addressLoading, setAddressLoading] = useState(false)

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [addressForm, setAddressForm] = useState(emptyForm)
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ displayName: string; latitude: number; longitude: number }>>([])
  const [suggestionLoading, setSuggestionLoading] = useState(false)

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

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  )

  async function loadAddresses() {
    const userId = getEffectiveUserId()
    if (!userId) return

    setAddressLoading(true)
    try {
      const list = await getShippingAddresses(userId)
      setAddresses(list)
      const defaultAddress = list.find((item) => item.isDefault)
      setSelectedAddressId((prev) => prev ?? defaultAddress?.id ?? list[0]?.id ?? null)
    } catch (e: any) {
      toast.error(e?.message ?? 'Khong tai duoc danh sach dia chi')
    } finally {
      setAddressLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  useEffect(() => {
    if (!showAddressForm) {
      setAddressSuggestions([])
      return
    }

    const keyword = addressForm.addressLine.trim()
    if (keyword.length < 6) {
      setAddressSuggestions([])
      return
    }

    const timer = window.setTimeout(async () => {
      setSuggestionLoading(true)
      try {
        const result = await searchVietnamAddress(keyword)
        setAddressSuggestions(result)
      } catch {
        setAddressSuggestions([])
      } finally {
        setSuggestionLoading(false)
      }
    }, 450)

    return () => window.clearTimeout(timer)
  }, [addressForm.addressLine, showAddressForm])

  function openCreateForm() {
    setEditingAddressId(null)
    setAddressForm(emptyForm)
    setAddressSuggestions([])
    setShowAddressForm(true)
  }

  function openEditForm(address: ShippingAddress) {
    setEditingAddressId(address.id)
    setAddressForm({
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      addressLine: address.addressLine,
      latitude: String(address.latitude),
      longitude: String(address.longitude),
    })
    setAddressSuggestions([])
    setShowAddressForm(true)
  }

  async function handleSaveAddress() {
    const userId = getEffectiveUserId()
    if (!userId) {
      toast.error('Khong tim thay userId')
      return
    }

    const lat = parseNumber(addressForm.latitude)
    const lng = parseNumber(addressForm.longitude)

    if (!addressForm.recipientName.trim() || !addressForm.phoneNumber.trim() || !addressForm.addressLine.trim()) {
      toast.error('Vui long nhap day du thong tin dia chi')
      return
    }
    if (lat === null || lng === null) {
      toast.error('Toa do dia chi khong hop le')
      return
    }

    const payload: ShippingAddressRequest = {
      userId,
      recipientName: addressForm.recipientName.trim(),
      phoneNumber: addressForm.phoneNumber.trim(),
      addressLine: addressForm.addressLine.trim(),
      latitude: lat,
      longitude: lng,
      isDefault: addresses.length === 0,
    }

    setLoading(true)
    try {
      const saved = editingAddressId
        ? await updateShippingAddress(editingAddressId, payload)
        : await createShippingAddress(payload)

      toast.success(editingAddressId ? 'Da cap nhat dia chi' : 'Da them dia chi moi')
      setShowAddressForm(false)
      await loadAddresses()
      setSelectedAddressId(saved.id)
    } catch (e: any) {
      toast.error(e?.message ?? 'Khong luu duoc dia chi')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetDefault(addressId: number) {
    const userId = getEffectiveUserId()
    if (!userId) return

    setLoading(true)
    try {
      await setDefaultShippingAddress(addressId, userId)
      await loadAddresses()
      setSelectedAddressId(addressId)
      toast.success('Da dat dia chi mac dinh')
    } catch (e: any) {
      toast.error(e?.message ?? 'Khong dat duoc mac dinh')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAddress(addressId: number) {
    const userId = getEffectiveUserId()
    if (!userId) return

    setLoading(true)
    try {
      await deleteShippingAddress(addressId, userId)
      await loadAddresses()
      toast.success('Da xoa dia chi')
    } catch (e: any) {
      toast.error(e?.message ?? 'Khong xoa duoc dia chi')
    } finally {
      setLoading(false)
    }
  }

  function buildCheckoutPayload(): CheckoutRequest | null {
    const userId = getEffectiveUserId()
    if (!userId) {
      toast.error('Khong tim thay userId')
      return null
    }

    if (!selectedAddressId) {
      toast.error('Vui long chon dia chi giao hang')
      return null
    }

    return {
      userId,
      shippingAddressId: selectedAddressId,
      voucherCode: voucherCode.trim() || undefined,
    }
  }

  async function handlePreview() {
    const payload = buildCheckoutPayload()
    if (!payload) return

    setLoading(true)
    try {
      const data = await previewCheckout(payload)
      setPreview(data)
    } catch (e: any) {
      toast.error(e?.message ?? 'Khong the xem truoc don hang')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout() {
    const payload = buildCheckoutPayload()
    if (!payload) return

    setLoading(true)
    try {
      const data = await submitCheckout(payload)
      toast.success(`Dat hang thanh cong #${data.id}`)
      setPreview(data)
    } catch (e: any) {
      toast.error(e?.message ?? 'Thanh toan that bai')
    } finally {
      setLoading(false)
    }
  }

  const formLat = parseNumber(addressForm.latitude)
  const formLng = parseNumber(addressForm.longitude)

  return (
    <div className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_top,_#fff5e6_0%,_#f8fafc_40%,_#e9eef6_100%)] px-4 py-8 sm:px-8">
      <div className="mx-auto grid w-full max-w-[1240px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-[#e7dfd1] bg-white/85 p-6 shadow-[0_18px_40px_rgba(106,78,32,0.12)] backdrop-blur">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#a28354]">Checkout</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Chon dia chi giao hang
              </h1>
              <p className="mt-2 text-sm text-slate-600">Luu nhieu dia chi, dat mac dinh, va dat hang nhanh nhu Shopee.</p>
            </div>
            <Link href="/cart" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300">
              <ArrowLeft size={16} />
              Ve gio hang
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#fff9ef] to-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin size={16} className="text-amber-600" />
                Dia chi da luu
              </div>
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-slate-800"
              >
                <Plus size={14} />
                Them dia chi
              </button>
            </div>

            {addressLoading && <p className="text-sm text-slate-500">Dang tai dia chi...</p>}

            {!addressLoading && addresses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Chua co dia chi nao. Bam "Them dia chi" de bat dau.
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {addresses.map((item) => {
                const selected = item.id === selectedAddressId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAddressId(item.id)}
                    className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-amber-400 bg-amber-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold text-slate-900">{item.recipientName}</div>
                      {item.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                          <Star size={10} /> Mac dinh
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.phoneNumber}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-700">{item.addressLine}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Lat {item.latitude}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Lng {item.longitude}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      {!item.isDefault && (
                        <span onClick={(e) => { e.stopPropagation(); handleSetDefault(item.id) }} className="cursor-pointer rounded-full border border-emerald-300 px-2 py-1 text-emerald-700">Dat mac dinh</span>
                      )}
                      <span onClick={(e) => { e.stopPropagation(); openEditForm(item) }} className="cursor-pointer rounded-full border border-slate-300 px-2 py-1 text-slate-700">Sua</span>
                      <span onClick={(e) => { e.stopPropagation(); handleDeleteAddress(item.id) }} className="cursor-pointer rounded-full border border-rose-300 px-2 py-1 text-rose-700">Xoa</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {showAddressForm && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800">{editingAddressId ? 'Cap nhat dia chi' : 'Dia chi moi'}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input value={addressForm.recipientName} onChange={(e) => setAddressForm((p) => ({ ...p, recipientName: e.target.value }))} placeholder="Nguoi nhan" className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                <input value={addressForm.phoneNumber} onChange={(e) => setAddressForm((p) => ({ ...p, phoneNumber: e.target.value }))} placeholder="So dien thoai" className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                <input value={addressForm.latitude} onChange={(e) => setAddressForm((p) => ({ ...p, latitude: e.target.value }))} placeholder="Latitude" className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                <input value={addressForm.longitude} onChange={(e) => setAddressForm((p) => ({ ...p, longitude: e.target.value }))} placeholder="Longitude" className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>

              {formLat !== null && formLng !== null ? (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">Chon toa do tren ban do</p>
                  <AddressMapPicker
                    latitude={formLat}
                    longitude={formLng}
                    onChange={(coords) =>
                      setAddressForm((p) => ({
                        ...p,
                        latitude: coords.latitude.toFixed(6),
                        longitude: coords.longitude.toFixed(6),
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-white/70 p-3 text-xs text-amber-700">
                  Nhap latitude/longitude hop le de hien thi ban do.
                </div>
              )}

              <textarea value={addressForm.addressLine} onChange={(e) => setAddressForm((p) => ({ ...p, addressLine: e.target.value }))} placeholder="So nha, duong, phuong/xa, quan/huyen, tinh/thanh" className="mt-3 min-h-[100px] w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
              <div className="mt-2">
                {suggestionLoading && (
                  <p className="text-xs text-amber-700">Dang tim goi y dia chi...</p>
                )}
                {!suggestionLoading && addressSuggestions.length > 0 && (
                  <div className="max-h-56 overflow-auto rounded-xl border border-amber-200 bg-white">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
                        type="button"
                        onClick={() => {
                          setAddressForm((p) => ({
                            ...p,
                            addressLine: suggestion.displayName,
                            latitude: suggestion.latitude.toFixed(6),
                            longitude: suggestion.longitude.toFixed(6),
                          }))
                          setAddressSuggestions([])
                        }}
                        className="block w-full border-b border-amber-100 px-3 py-2 text-left text-xs text-slate-700 last:border-b-0 hover:bg-amber-50"
                      >
                        {suggestion.displayName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={handleSaveAddress} className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-amber-500">Luu dia chi</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Dong</button>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4">
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
                disabled={loading || !selectedAddress}
                className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Ap dung
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif' }}>
              Hoa don tam tinh
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Tien sach</span><span className="font-semibold text-slate-900">{formattedCurrency.format(preview?.subtotalAmount ?? 0)}</span></div>
              <div className="flex items-center justify-between"><span>Phi van chuyen</span><span className="font-semibold text-slate-900">{formattedCurrency.format(preview?.baseShippingFee ?? 0)}</span></div>
              <div className="flex items-center justify-between"><span>Giam phi ship</span><span className="font-semibold text-emerald-600">-{formattedCurrency.format(preview?.shippingDiscount ?? 0)}</span></div>
              <div className="flex items-center justify-between"><span>Giam gia don</span><span className="font-semibold text-emerald-600">-{formattedCurrency.format(preview?.orderDiscount ?? 0)}</span></div>
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-base font-semibold text-slate-900"><span>Tong thanh toan</span><span>{formattedCurrency.format(preview?.finalTotal ?? 0)}</span></div>
            </div>

            <div className="mt-6 space-y-3">
              <button type="button" onClick={handlePreview} disabled={loading || !selectedAddress} className="w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70">Xem truoc</button>
              <button type="button" onClick={handleCheckout} disabled={loading || !selectedAddress} className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">{loading ? 'Dang xu ly...' : 'Tien hanh thanh toan'}</button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#334155] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Dia chi dang chon</p>
            <h3 className="mt-2 text-xl font-semibold" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              {selectedAddress?.recipientName ?? 'Chua chon'}
            </h3>
            <p className="mt-2 text-sm text-slate-200">{selectedAddress?.addressLine ?? 'Vui long them hoac chon dia chi de tiep tuc.'}</p>
            <p className="mt-3 text-xs text-slate-300">{selectedAddress ? `${selectedAddress.phoneNumber} • ${selectedAddress.latitude}, ${selectedAddress.longitude}` : ''}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
