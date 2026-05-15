import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="min-h-[calc(100vh-84px)] bg-gradient-to-b from-[#fdf8ef] via-[#f7f4ee] to-[#eef2f7] px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[720px] rounded-3xl border border-amber-100 bg-white p-10 text-center shadow-[0_16px_40px_rgba(120,85,20,0.12)]">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Thank you</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Don hang cua ban da duoc ghi nhan
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Cam on ban da tin tuong BookHaven. Chung toi se giao hang som nhat co the.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/profile"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Quan ly tai khoan
          </Link>
          <Link
            href="/"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800"
          >
            Tiep tuc mua sam
          </Link>
        </div>
      </div>
    </div>
  )
}
