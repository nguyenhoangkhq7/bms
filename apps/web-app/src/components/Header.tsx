'use client';

import { useState } from 'react';
import { BookOpen, Search, ShoppingCart, User, Heart, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-[#f6f5f3]/95 backdrop-blur">
      <div className="flex w-full flex-col items-center justify-between gap-4 px-8 py-4 lg:flex-row lg:gap-8 lg:px-20">
        <div className="flex w-full flex-1 items-center justify-between gap-3 lg:gap-8">

          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl"
          >
            <BookOpen size={30} strokeWidth={2.5} />
            <span className="font-serif">BookHaven</span>
          </Link>

          <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-2xl lg:block">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sách, tác giả, nhà xuất bản..."
              className="w-full rounded-full border border-gray-300 bg-white py-3 pl-5 pr-12 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-black">
              <Search size={20} />
            </button>
          </form>

          <nav className="flex items-center gap-3 text-gray-700 sm:gap-5">
            <div className="hidden items-center gap-6 text-sm font-medium xl:flex">
              <Link href="/" className="transition-colors hover:text-black">
                Trang chủ
              </Link>
              <Link href="/" className="transition-colors hover:text-black">
                Danh mục
              </Link>
              <Link
                href="/add-book"
                className="flex items-center gap-1.5 transition-colors hover:text-black"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.3)';
                }}
              >
                <PlusCircle size={16} />
                Thêm sách
              </Link>
            </div>

            <div className="flex items-center gap-3 border-l border-gray-300 pl-3 sm:gap-5 sm:pl-5">
              <button className="relative transition-colors hover:text-black">
                <Heart size={20} />
              </button>
              <Link href="/" className="relative transition-colors hover:text-black">
                <ShoppingCart size={20} />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                  3
                </span>
              </Link>
              <button className="flex items-center gap-2 transition-colors hover:text-black">
                <User size={20} />
                <span className="hidden text-sm font-medium sm:block">Đăng nhập</span>
              </button>
            </div>
          </nav>
        </div>

        <form onSubmit={handleSearch} className="relative w-full lg:hidden">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sách, tác giả, nhà xuất bản..."
            className="w-full rounded-full border border-gray-300 bg-white py-3 pl-5 pr-12 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-black">
            <Search size={20} />
          </button>
        </form>
      </div>
    </header>
  );
}
