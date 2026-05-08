"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  DiscountType,
  Voucher,
  VoucherPayload,
  VoucherStatus,
  voucherService,
} from "@/src/api/voucherService";

type VoucherFormState = {
  code: string;
  discountType: DiscountType;
  discountAmount: string;
  maxDiscountAmount: string;
  minOrderValue: string;
  startAt: string;
  endAt: string;
  usageLimit: string;
  status: VoucherStatus;
  description: string;
};

const EMPTY_FORM: VoucherFormState = {
  code: "",
  discountType: "FIXED_AMOUNT",
  discountAmount: "",
  maxDiscountAmount: "",
  minOrderValue: "0",
  startAt: "",
  endAt: "",
  usageLimit: "",
  status: "ACTIVE",
  description: "",
};

const STATUS_LABEL: Record<VoucherStatus, string> = {
  ACTIVE: "Dang ap dung",
  EXPIRED: "Het han",
  DISABLED: "Tam tat",
  DELETED: "Da xoa",
};

const STATUS_CLASS: Record<VoucherStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EXPIRED: "bg-amber-50 text-amber-700 border-amber-200",
  DISABLED: "bg-slate-100 text-slate-600 border-slate-200",
  DELETED: "bg-rose-50 text-rose-700 border-rose-200",
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

function toApiDateTime(value: string) {
  return value ? `${value}:00` : null;
}

function money(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function toPayload(form: VoucherFormState): VoucherPayload {
  return {
    code: form.code.trim().toUpperCase(),
    discountType: form.discountType,
    discountAmount: Number(form.discountAmount),
    maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
    minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
    startAt: toApiDateTime(form.startAt),
    endAt: toApiDateTime(form.endAt),
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    status: form.status,
    description: form.description.trim() || null,
  };
}

function validateForm(form: VoucherFormState) {
  if (!form.code.trim()) return "Ma voucher la bat buoc";
  if (!/^[A-Z0-9_-]{3,40}$/i.test(form.code.trim())) {
    return "Ma voucher chi gom chu, so, dau gach ngang hoac gach duoi";
  }
  const discount = Number(form.discountAmount);
  if (!Number.isFinite(discount) || discount <= 0) return "Gia tri giam phai lon hon 0";
  if (form.discountType === "PERCENTAGE" && discount > 100) {
    return "Voucher phan tram khong duoc vuot qua 100%";
  }
  if (form.maxDiscountAmount && Number(form.maxDiscountAmount) < 0) {
    return "Giam toi da khong duoc am";
  }
  if (form.minOrderValue && Number(form.minOrderValue) < 0) {
    return "Gia tri don toi thieu khong duoc am";
  }
  if (form.usageLimit && Number(form.usageLimit) < 0) {
    return "Gioi han luot dung khong duoc am";
  }
  if (form.startAt && form.endAt && new Date(form.endAt) <= new Date(form.startAt)) {
    return "Thoi gian ket thuc phai sau thoi gian bat dau";
  }
  return null;
}

export default function VoucherManagementPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState<VoucherFormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const filteredVouchers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return vouchers.filter((voucher) => {
      const matchStatus = statusFilter === "ALL" || voucher.status === statusFilter;
      const matchQuery =
        !normalizedQuery ||
        voucher.code.toLowerCase().includes(normalizedQuery) ||
        (voucher.description ?? "").toLowerCase().includes(normalizedQuery);
      return matchStatus && matchQuery;
    });
  }, [query, statusFilter, vouchers]);

  async function loadVouchers() {
    setLoading(true);
    try {
      const data = await voucherService.getAll();
      setVouchers(data.sort((a, b) => b.id - a.id));
    } catch (error: any) {
      toast.error(error.message || "Khong tai duoc danh sach voucher");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVouchers();
  }, []);

  function startEdit(voucher: Voucher) {
    setEditing(voucher);
    setForm({
      code: voucher.code,
      discountType: voucher.discountType ?? "FIXED_AMOUNT",
      discountAmount: String(voucher.discountAmount ?? ""),
      maxDiscountAmount: voucher.maxDiscountAmount ? String(voucher.maxDiscountAmount) : "",
      minOrderValue: String(voucher.minOrderValue ?? 0),
      startAt: toDateTimeLocal(voucher.startAt),
      endAt: toDateTimeLocal(voucher.endAt),
      usageLimit: voucher.usageLimit ? String(voucher.usageLimit) : "",
      status: voucher.status,
      description: voucher.description ?? "",
    });
  }

  function resetForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await voucherService.update(editing.id, toPayload(form));
        toast.success("Da cap nhat voucher");
      } else {
        await voucherService.create(toPayload(form));
        toast.success("Da tao voucher");
      }
      resetForm();
      await loadVouchers();
    } catch (error: any) {
      toast.error(error.message || "Khong luu duoc voucher");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(voucher: Voucher, status: VoucherStatus) {
    try {
      await voucherService.updateStatus(voucher.id, status);
      toast.success("Da cap nhat trang thai");
      await loadVouchers();
    } catch (error: any) {
      toast.error(error.message || "Khong cap nhat duoc trang thai");
    }
  }

  async function softDelete(voucher: Voucher) {
    try {
      await voucherService.softDelete(voucher.id);
      toast.success("Da chuyen voucher sang trang thai da xoa");
      await loadVouchers();
    } catch (error: any) {
      toast.error(error.message || "Khong xoa duoc voucher");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f5f3] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Promotion Admin
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Quan ly voucher</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Tao, sua, tam tat, het han hoac xoa mem voucher. Voucher da xoa van giu trong DB de doi soat.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Voucher moi
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">
                {editing ? "Sua voucher" : "Them voucher"}
              </h2>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Huy sua
                </button>
              )}
            </div>

            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Ma voucher</label>
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  placeholder="VD: SUMMER20"
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Kieu giam</label>
                  <select
                    value={form.discountType}
                    onChange={(event) =>
                      setForm({ ...form, discountType: event.target.value as DiscountType })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="FIXED_AMOUNT">Tien mat</option>
                    <option value="PERCENTAGE">Phan tram</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Gia tri</label>
                  <input
                    type="number"
                    min="0"
                    value={form.discountAmount}
                    onChange={(event) => setForm({ ...form, discountAmount: event.target.value })}
                    placeholder={form.discountType === "PERCENTAGE" ? "20" : "50000"}
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Giam toi da</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscountAmount}
                    onChange={(event) => setForm({ ...form, maxDiscountAmount: event.target.value })}
                    placeholder="Bo trong neu khong gioi han"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Don toi thieu</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderValue}
                    onChange={(event) => setForm({ ...form, minOrderValue: event.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Bat dau</label>
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(event) => setForm({ ...form, startAt: event.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Ket thuc</label>
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(event) => setForm({ ...form, endAt: event.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Luot dung</label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(event) => setForm({ ...form, usageLimit: event.target.value })}
                    placeholder="Khong gioi han"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Trang thai</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value as VoucherStatus })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="ACTIVE">Dang ap dung</option>
                    <option value="DISABLED">Tam tat</option>
                    <option value="EXPIRED">Het han</option>
                    <option value="DELETED">Da xoa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Mo ta</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={3}
                  placeholder="VD: Giam cho don hang tu 300k trong thang khai truong"
                  className="w-full resize-none rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Dang luu..." : editing ? "Cap nhat voucher" : "Tao voucher"}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative max-w-lg flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tim theo ma hoac mo ta"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["ALL", "ACTIVE", "DISABLED", "EXPIRED", "DELETED"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium ${
                      statusFilter === status
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {status === "ALL" ? "Tat ca" : STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Voucher</th>
                    <th className="px-5 py-3">Gia tri</th>
                    <th className="px-5 py-3">Dieu kien</th>
                    <th className="px-5 py-3">Hieu luc</th>
                    <th className="px-5 py-3">Trang thai</th>
                    <th className="px-5 py-3 text-right">Thao tac</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                        Dang tai voucher...
                      </td>
                    </tr>
                  ) : filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                        Khong co voucher phu hop
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <tr key={voucher.id} className="align-top hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-950">{voucher.code}</div>
                          <div className="mt-1 max-w-xs text-slate-500">{voucher.description || "Khong co mo ta"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {voucher.discountType === "PERCENTAGE"
                              ? `${voucher.discountAmount}%`
                              : money(voucher.discountAmount)}
                          </div>
                          {voucher.maxDiscountAmount ? (
                            <div className="mt-1 text-slate-500">Toi da {money(voucher.maxDiscountAmount)}</div>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <div>Don tu {money(voucher.minOrderValue)}</div>
                          <div className="mt-1">
                            Da dung {voucher.usedCount ?? 0}
                            {voucher.usageLimit ? `/${voucher.usageLimit}` : " / khong gioi han"}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <div>{voucher.startAt ? new Date(voucher.startAt).toLocaleString("vi-VN") : "Bat dau ngay"}</div>
                          <div className="mt-1">{voucher.endAt ? new Date(voucher.endAt).toLocaleString("vi-VN") : "Khong het han"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[voucher.status]}`}>
                            {STATUS_LABEL[voucher.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(voucher)}
                              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:border-slate-400 hover:text-slate-950"
                              title="Sua"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => changeStatus(voucher, "ACTIVE")}
                              className="rounded-md border border-slate-200 p-2 text-emerald-600 hover:border-emerald-300"
                              title="Kich hoat"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => changeStatus(voucher, "DISABLED")}
                              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:border-slate-400"
                              title="Tam tat"
                            >
                              <Ban size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => changeStatus(voucher, "EXPIRED")}
                              className="rounded-md border border-slate-200 p-2 text-amber-600 hover:border-amber-300"
                              title="Danh dau het han"
                            >
                              <Clock size={16} />
                            </button>
                            {voucher.status === "DELETED" ? (
                              <button
                                type="button"
                                onClick={() => changeStatus(voucher, "DISABLED")}
                                className="rounded-md border border-slate-200 p-2 text-slate-600 hover:border-slate-400"
                                title="Khoi phuc ve tam tat"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => softDelete(voucher)}
                                className="rounded-md border border-slate-200 p-2 text-rose-600 hover:border-rose-300"
                                title="Xoa mem"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
