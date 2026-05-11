"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Plus, Sparkles, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/src/auth/context'
import { getEffectiveUserId } from '@/src/cart/utils/userContext'
import { previewCheckout, submitCheckout } from '@/src/checkout/services/checkoutService'
import type { CheckoutPreviewResponse, CheckoutRequest, ShippingAddress, ShippingAddressRequest } from '@/src/checkout/types'
import { getCart } from '@/src/cart/services/cartService'
import { bookService } from '@/src/api/bookService'
import type { CartItem } from '@/src/cart/types'
import {
  createShippingAddress,
  deleteShippingAddress,
  getShippingAddresses,
  setDefaultShippingAddress,
  updateShippingAddress,
} from '@/src/api/shippingAddressService'
import { searchVietnamAddress } from '@/src/api/geocodingService'
import { getDistrictsByProvinceCode, getProvinces, type District, type Province } from '@/src/api/vnAddressService'

const emptyForm = {
  recipientName: '',
  phoneNumber: '',
  detailAddress: '',
  provinceCode: '',
  districtCode: '',
}

function normalizeAdministrativeName(value: string) {
  return value
    .replace(/^(quan|huyen|thi xa|thanh pho)\s+/i, '')
    .replace(/^(tinh|thanh pho)\s+/i, '')
    .trim()
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export default function CheckoutPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { isSignedIn, isLoading: authLoading } = useAuth()
  const canLoadCheckoutData = !authLoading && isSignedIn
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null)
  const [subtotalFallback, setSubtotalFallback] = useState(0)
  const [voucherCode, setVoucherCode] = useState('')

  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [addressLoading, setAddressLoading] = useState(false)

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [addressForm, setAddressForm] = useState(emptyForm)

  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])

  const formattedCurrency = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }),
    []
  )

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  )

  async function resolveCoordinates(districtName: string, provinceName: string) {
    const normalizedDistrict = normalizeAdministrativeName(districtName)
    const normalizedProvince = normalizeAdministrativeName(provinceName)

    const queries = [
      `${districtName}, ${provinceName}, Viet Nam`,
      `${normalizedDistrict}, ${provinceName}, Viet Nam`,
      `${districtName}, ${normalizedProvince}, Viet Nam`,
      `${normalizedDistrict}, ${normalizedProvince}, Viet Nam`,
      `${provinceName}, Viet Nam`,
      `${normalizedProvince}, Viet Nam`,
    ]

    for (const query of queries) {
      const results = await searchVietnamAddress(query)
      if (results.length > 0) {
        return results[0]
      }
    }

    return null
  }

  useEffect(() => {
    if (!canLoadCheckoutData) {
      return
    }

    ;(async () => {
      try {
        const result = await getProvinces()
        setProvinces(result)
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Khong tai duoc tinh/thanh'))
      }
    })()
  }, [canLoadCheckoutData])

  useEffect(() => {
    if (!canLoadCheckoutData) {
      return
    }

    const provinceCode = Number(addressForm.provinceCode)
    if (!Number.isFinite(provinceCode) || provinceCode <= 0) {
      setDistricts([])
      return
    }

    ;(async () => {
      try {
        const result = await getDistrictsByProvinceCode(provinceCode)
        setDistricts(result)
      } catch {
        setDistricts([])
      }
    })()
  }, [addressForm.provinceCode, canLoadCheckoutData])

  async function loadAddresses() {
    const userId = getEffectiveUserId()
    if (!userId) return

    setAddressLoading(true)
    try {
      const list = await getShippingAddresses(userId)
      setAddresses(list)
      const defaultAddress = list.find((item) => item.isDefault)
      setSelectedAddressId((prev) => prev ?? defaultAddress?.id ?? list[0]?.id ?? null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Khong tai duoc danh sach dia chi'))
    } finally {
      setAddressLoading(false)
    }
  }

  useEffect(() => {
    if (!canLoadCheckoutData) {
      return
    }

    loadAddresses()
  }, [canLoadCheckoutData])

  useEffect(() => {
    if (!canLoadCheckoutData) {
      return
    }

    ;(async () => {
      try {
        const userId = getEffectiveUserId()
        const cart = await getCart(userId)
        const ids: number[] = Array.from(
          new Set<number>((cart.items ?? []).map((item: CartItem) => item.bookId))
        )
        const entries = await Promise.all(
          ids.map(async (id: number) => {
            try {
              return [id, await bookService.getBookById(id)] as const
            } catch {
              return [id, null] as const
            }
          })
        )
        const priceMap = new Map<number, number>()
        for (const [id, book] of entries) {
          priceMap.set(id, Number(book?.price ?? 0))
        }
        const subtotal = (cart.items ?? []).reduce((sum: number, item: CartItem) => {
          return sum + (priceMap.get(item.bookId) ?? 0) * item.quantity
        }, 0)
        setSubtotalFallback(subtotal)
      } catch {
        setSubtotalFallback(0)
      }
    })()
  }, [canLoadCheckoutData])

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [authLoading, isSignedIn, pathname, router])

  function openCreateForm() {
    setEditingAddressId(null)
    setAddressForm(emptyForm)
    setShowAddressForm(true)
  }

  function openEditForm(address: ShippingAddress) {
    setEditingAddressId(address.id)
    setAddressForm({
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      detailAddress: address.addressLine,
      provinceCode: '',
      districtCode: '',
    })
    setDistricts([])
    setShowAddressForm(true)
  }

  async function handleSaveAddress() {
    const userId = getEffectiveUserId()
    if (!userId) {
      toast.error('Khong tim thay userId')
      return
    }

    const provinceCode = Number(addressForm.provinceCode)
    const districtCode = Number(addressForm.districtCode)
    const province = provinces.find((item) => item.code === provinceCode)
    const district = districts.find((item) => item.code === districtCode)

    if (!addressForm.recipientName.trim() || !addressForm.phoneNumber.trim() || !addressForm.detailAddress.trim()) {
      toast.error('Vui long nhap day du thong tin dia chi')
      return
    }

    if (!province || !district) {
      toast.error('Vui long chon tinh/thanh va quan/huyen')
      return
    }

    const fullAddress = `${addressForm.detailAddress.trim()}, ${district.name}, ${province.name}, Viet Nam`

    setLoading(true)
    try {
      const best = await resolveCoordinates(district.name, province.name)

      if (!best) {
        throw new Error('Khong tim thay toa do theo huyen/tinh. Vui long thu huyen/tinh khac.')
      }

      const payload: ShippingAddressRequest = {
        userId,
        recipientName: addressForm.recipientName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        addressLine: fullAddress,
        latitude: best.latitude,
        longitude: best.longitude,
        isDefault: addresses.length === 0,
      }

      const saved = editingAddressId
        ? await updateShippingAddress(editingAddressId, payload)
        : await createShippingAddress(payload)

      toast.success(editingAddressId ? 'Da cap nhat dia chi' : 'Da them dia chi moi')
      setShowAddressForm(false)
      await loadAddresses()
      setSelectedAddressId(saved.id)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Khong luu duoc dia chi'))
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Khong dat duoc mac dinh'))
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Khong xoa duoc dia chi'))
    } finally {
      setLoading(false)
    }
  }

  const buildCheckoutPayload = useCallback((): CheckoutRequest | null => {
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
  }, [selectedAddressId, voucherCode])

  useEffect(() => {
    if (!selectedAddressId) {
      setPreview(null)
      return
    }

    const timer = window.setTimeout(async () => {
      const payload = buildCheckoutPayload()
      if (!payload) return

      setPreviewLoading(true)
      try {
        const data = await previewCheckout(payload)
        setPreview(data)
      } catch {
        // silent: user can still trigger manual preview to see explicit error
      } finally {
        setPreviewLoading(false)
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [selectedAddressId, voucherCode, canLoadCheckoutData, buildCheckoutPayload])

  async function handleCheckout() {
    const payload = buildCheckoutPayload()
    if (!payload) return

    setLoading(true)
    try {
      const data = await submitCheckout(payload)
      toast.success(`Dat hang thanh cong #${data.id}`)
      setPreview(data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Thanh toan that bai'))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 py-12">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-[1240px] items-center justify-center text-slate-500">
          Đang chuyển đến trang đăng nhập...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_top,_#fff5e6_0%,_#f8fafc_40%,_#e9eef6_100%)] px-4 py-8 sm:px-8">
      <div className="mx-auto grid w-full max-w-[1240px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-[#e7dfd1] bg-white/85 p-6 shadow-[0_18px_40px_rgba(106,78,32,0.12)] backdrop-blur">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#a28354]">Checkout</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Chọn địa chỉ giao hàng
              </h1>
              <p className="mt-2 text-sm text-slate-600">Chọn địa chỉ đã lưu hoặc thêm địa chỉ mới.</p>
            </div>
            <Link href="/cart" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300">
              <ArrowLeft size={16} />
              Về giỏ hàng
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#fff9ef] to-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin size={16} className="text-amber-600" />
                Địa chỉ đã lưu
              </div>
              <button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-slate-800">
                <Plus size={14} />
                Thêm địa chỉ
              </button>
            </div>

            {addressLoading && <p className="text-sm text-slate-500">Đang tải...</p>}
            {!addressLoading && addresses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Vui lòng thêm địa chỉ.</div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {addresses.map((item) => {
                const selected = item.id === selectedAddressId
                return (
                  <button key={item.id} type="button" onClick={() => setSelectedAddressId(item.id)} className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-amber-400 bg-amber-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold text-slate-900">{item.recipientName}</div>
                      {item.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><Star size={10} /> Mac dinh</span>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.phoneNumber}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-700">{item.addressLine}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      {!item.isDefault && <span onClick={(e) => { e.stopPropagation(); handleSetDefault(item.id) }} className="cursor-pointer rounded-full border border-emerald-300 px-2 py-1 text-emerald-700">Dat mac dinh</span>}
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
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800">{editingAddressId ? 'Cập nhật địa chỉ' : 'Địa chỉ mới'}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input value={addressForm.recipientName} onChange={(e) => setAddressForm((p) => ({ ...p, recipientName: e.target.value }))} placeholder="Nguoi nhan" className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                <input value={addressForm.phoneNumber} onChange={(e) => setAddressForm((p) => ({ ...p, phoneNumber: e.target.value }))} placeholder="So dien thoai" className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
                <select
                  value={addressForm.provinceCode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, provinceCode: e.target.value, districtCode: '' }))}
                  className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((item) => (
                    <option key={item.code} value={item.code}>{item.name}</option>
                  ))}
                </select>
                <select
                  value={addressForm.districtCode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, districtCode: e.target.value }))}
                  className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((item) => (
                    <option key={item.code} value={item.code}>{item.name}</option>
                  ))}
                </select>
              </div>

              <input
                value={addressForm.detailAddress}
                onChange={(e) => setAddressForm((p) => ({ ...p, detailAddress: e.target.value }))}
                placeholder="So nha, duong, xa/phuong"
                className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
              />

              <div className="mt-3 flex gap-2">
                <button type="button" onClick={handleSaveAddress} className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-amber-500">Luu dia chi</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Dong</button>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700"><Sparkles size={16} />Voucher</div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} placeholder="Nhap ma giam gia" className="w-full flex-1 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-amber-400 focus:outline-none" />
            </div>
            {/* <p className="mt-2 text-xs text-amber-700">Phi ship va tong tien tu dong cap nhat khi ban doi dia chi hoac voucher.</p> */}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"Space Grotesk", "Trebuchet MS", sans-serif' }}>Hóa đơn tạm tính</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Tiền sách</span><span className="font-semibold text-slate-900">{formattedCurrency.format(preview?.subtotalAmount ?? subtotalFallback)}</span></div>
              <div className="flex items-center justify-between"><span>Phí vận chuyển</span><span className="font-semibold text-slate-900">{formattedCurrency.format(preview?.baseShippingFee ?? 0)}</span></div>
              <div className="flex items-center justify-between"><span>Giảm phí ship</span><span className="font-semibold text-emerald-600">-{formattedCurrency.format(preview?.shippingDiscount ?? 0)}</span></div>
              <div className="flex items-center justify-between"><span>Khuyến mãi</span><span className="font-semibold text-emerald-600">-{formattedCurrency.format(preview?.orderDiscount ?? 0)}</span></div>
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 text-base font-semibold text-slate-900"><span>Tổng thanh toán</span><span>{formattedCurrency.format(preview?.finalTotal ?? 0)}</span></div>
              {previewLoading && <div className="text-xs text-slate-500">Đang cập nhật...</div>}
            </div>

            <div className="mt-6 space-y-3">
              <button type="button" onClick={handleCheckout} disabled={loading || !selectedAddress} className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">{loading ? 'Dang xu ly...' : 'Tien hanh thanh toan'}</button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#334155] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Địa chỉ giao hàng</p>
            <h3 className="mt-2 text-xl font-semibold" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>{selectedAddress?.recipientName ?? 'Chua chon'}</h3>
            <p className="mt-2 text-sm text-slate-200">{selectedAddress?.addressLine ?? 'Vui long them hoac chon dia chi de tiep tuc.'}</p>
            <p className="mt-3 text-xs text-slate-300">{selectedAddress ? selectedAddress.phoneNumber : ''}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
