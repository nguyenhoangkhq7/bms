"use client";

import { useEffect, useState, useMemo } from "react";
import { getRevenue, Period } from "@/src/api/reportService";

function money(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v ?? 0);
}

function toCSV(rows: any[]) {
  const headers = ["bucket", "revenue"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const b = (r.bucket ?? "").toString();
    const rev = (r.revenue ?? 0).toString();
    lines.push([`"${b}"`, rev].join(","));
  }
  return lines.join("\n");
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => { void load(); }, [period]);

  async function load() {
    setLoading(true);
    try {
      // if user provided startDate, pass it as date param (report-service accepts a single ref date)
      const ref = startDate || undefined;
      const res = await getRevenue(period, ref);
      setData(res);
    } catch (e: any) {
      console.error(e);
      setData([]);
    } finally { setLoading(false); }
  }

  function exportCsv() {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxRevenue = useMemo(() => {
    return data.reduce((m: number, r: any) => Math.max(m, Number(r.revenue ?? 0)), 0);
  }, [data]);

  return (
    <div className="min-h-screen bg-[#f6f5f3] px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Reports</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Doanh thu</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="rounded-md border px-3 py-2">
            <option value="week">Theo tuan</option>
            <option value="month">Theo thang</option>
            <option value="year">Theo nam</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            Tu ngay
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            Den ngay
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded border px-2 py-1" />
          </label>

          <button onClick={() => { setStartDate(''); setEndDate(''); setPeriod('week'); }} className="rounded border px-3 py-2 text-sm">Reset</button>
          <button onClick={() => void load()} className="rounded bg-slate-900 text-white px-3 py-2">Tai</button>
          <button onClick={exportCsv} className="rounded border px-3 py-2 text-sm">Export CSV</button>
        </div>

        <section className="rounded-lg border bg-white p-4">
          {loading ? <p>Dang tai...</p> : (
            <div>
              <div className="mb-4">
                {/* Simple SVG bar chart */}
                <div className="overflow-x-auto">
                  <svg width={Math.max(600, data.length * 120)} height={200} className="w-full">
                    {data.map((r: any, i: number) => {
                      const val = Number(r.revenue ?? 0);
                      const h = maxRevenue > 0 ? Math.round((val / maxRevenue) * 140) : 0;
                      const x = 40 + i * 120;
                      const y = 160 - h;
                      return (
                        <g key={i}>
                          <rect x={x} y={y} width={60} height={h} fill="#7c3aed" rx={6} />
                          <text x={x + 30} y={178} fontSize={12} textAnchor="middle" fill="#334155">{String(r.bucket).slice(0,10)}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-slate-600">
                    <th className="p-2">Khoang thoi gian</th>
                    <th className="p-2">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && <tr><td colSpan={2} className="p-4 text-sm text-slate-500">Khong co du lieu</td></tr>}
                  {data.map((r: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2 text-sm">{String(r.bucket)}</td>
                      <td className="p-2 text-right font-medium">{money(Number(r.revenue))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
