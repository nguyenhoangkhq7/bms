'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  Star, 
  ChevronDown,
  ChevronRight,
  Library,
  BookOpen,
  Briefcase,
  Brain,
  Baby,
  GraduationCap,
  Landmark,
  Laptop,
  Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { bookService } from '@/src/api/bookService'; 
import { categoryService } from '@/src/api/categoryService';
import { useAddToCart } from '@/src/modules/cart/hooks/useAddToCart';
import { getEffectiveUserId } from '@/src/modules/cart/utils/userContext';
import type { Book, Category } from '@/src/types';

// Interface cho danh mục dạng cây (có danh mục con)
interface TreeCategory extends Category {
  parentId?: number | null;
  subCategories?: Category[];
}

// Interface cho raw category từ API
interface RawCategory extends Category {
  parentId: number | null;
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500">Đang tải...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('search') || '').toLowerCase();

  // State quản lý dữ liệu sách
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State quản lý danh mục
  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  
  // State quản lý khoảng giá
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pendingBookId, setPendingBookId] = useState<number | null>(null);
  const { addToCart, loading: addToCartLoading } = useAddToCart();

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
  };

  // Icon mapping cho các danh mục cha
  const getCategoryIcon = (categoryId: number) => {
    switch (categoryId) {
      case 1: return <BookOpen size={18} />;
      case 2: return <Briefcase size={18} />;
      case 3: return <Baby size={18} />;
      case 4: return <Brain size={18} />;
      case 6: return <GraduationCap size={18} />;
      case 11: 
      case 19: return <Laptop size={18} />;
      case 12: return <Landmark size={18} />;
      default: return <Library size={18} />;
    }
  };

  useEffect(() => {
    // Hàm tải danh sách sách
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await bookService.getAllBooks();
        setBooks(data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sách:", err);
        setError("Không thể tải danh sách sách. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    // Hàm tải và xử lý danh mục phân cấp
    const fetchCategories = async () => {
      try {
        const rawCategories = await categoryService.getAllCategories() as RawCategory[];
        
        // Dựa vào Postman: Lọc danh mục cha có parentId === null
        const parentCategories = rawCategories.filter(cat => cat.parentId === null);
        
        // Gộp danh mục con vào danh mục cha tương ứng
        const treeCategories: TreeCategory[] = parentCategories.map(parent => {
            return {
                ...parent,
                // Dựa vào Postman: Tìm các con có parentId trùng với id của cha
                subCategories: rawCategories.filter(child => child.parentId === parent.id)
            };
        });

        setCategories(treeCategories);
        
        // Mặc định mở rộng 3 danh mục đầu tiên
        if(treeCategories.length > 0) {
            setExpandedCategories(treeCategories.slice(0, 3).map(c => c.id));
        }

      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };

    fetchBooks();
    fetchCategories(); 
  }, []);

  // Hàm xử lý đóng/mở danh mục
  const toggleCategoryExpand = (categoryId: number) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Hàm xử lý chọn/bỏ chọn danh mục để lọc
  const toggleCategoryFilter = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
    // Cuộn lên đầu trang sau khi lọc
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tính toán danh sách sách sau khi lọc
  const filteredBooks = books.filter(book => {
    // Lọc theo danh mục
    const catId = book.category?.id || book.categoryId;
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(catId);

    // Lọc theo từ khóa tìm kiếm
    const title = (book.title || '').toLowerCase();
    const author = (book.author || '').toLowerCase();
    const publisher = (book.publisher || '').toLowerCase();

    const matchSearch = !searchQuery || 
                        title.includes(searchQuery) || 
                        author.includes(searchQuery) || 
                        publisher.includes(searchQuery);

    // Lọc theo khoảng giá
    const price = Number(book.price) || 0;
    const minP = minPrice ? Number(minPrice) : 0;
    const maxP = maxPrice ? Number(maxPrice) : Infinity;
    const matchPrice = price >= minP && price <= maxP;

    return matchCategory && matchSearch && matchPrice;
  });

  const hasActiveFilters = selectedCategories.length > 0 || Boolean(minPrice) || Boolean(maxPrice);

  const handleAddToCart = async (bookId: number) => {
    const userId = getEffectiveUserId();
    if (!userId) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      setPendingBookId(bookId);
      await addToCart({ userId, bookId, quantity: 1 });
    } finally {
      setPendingBookId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-84px)] bg-gradient-to-b from-[#f8fafc] via-[#f6f8fc] to-[#eef2f7]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 md:py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Sidebar Filters */}
      <aside className="w-full lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-2xl border border-[#e4e8f0] bg-white/95 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#eef2f7] pb-4">
            <h3 className="text-lg font-semibold text-slate-900">Danh mục</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                Xoá lọc
              </button>
            )}
          </div>
          
          <div className="mb-7">
            <div className="flex flex-col gap-2">
              {categories.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Đang tải danh mục...</p>
              ) : (
                  categories.map((parentCat) => {
                    const currentId = parentCat.id;
                    const isExpanded = expandedCategories.includes(currentId);
                    
                    return (
                      <div key={currentId} className="mb-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2 last:mb-0">
                            {/* Nút danh mục cha */}
                            <button 
                                onClick={() => toggleCategoryExpand(currentId)}
                          className="group flex w-full items-center justify-between py-1 text-left"
                            >
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-950">
                            <span className="text-slate-400 transition-colors group-hover:text-slate-700">
                                        {getCategoryIcon(currentId)}
                                    </span>
                                    {parentCat.name}
                                </span>
                                {parentCat.subCategories && parentCat.subCategories.length > 0 && (
                            <span className="text-slate-400 transition-colors group-hover:text-slate-700">
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </span>
                                )}
                            </button>

                            {/* Danh sách danh mục con */}
                            <div 
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isExpanded ? 'mt-3 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                              }`}
                            >
                              {parentCat.subCategories && parentCat.subCategories.length > 0 && (
                                  <div className="ml-6 flex flex-col gap-2 pb-1">
                                      {parentCat.subCategories.map((childCat) => {
                                        const childId = childCat.id;
                                        return (
                                          <label key={childId} className="group flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-slate-100">
                                              <input 
                                                type="checkbox" 
                                                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-700" 
                                                checked={selectedCategories.includes(childId)}
                                                onChange={() => toggleCategoryFilter(childId)}
                                              />
                                              <span className="text-sm text-slate-600 transition-colors group-hover:text-slate-900">
                                                  {childCat.name}
                                              </span>
                                          </label>
                                        );
                                      })}
                                  </div>
                              )}
                            </div>
                        </div>
                    );
                  })
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Khoảng giá</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Từ" 
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-700" 
              />
              <span className="text-slate-400">-</span>
              <input 
                type="number" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Đến" 
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-700" 
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative mb-7 overflow-hidden rounded-3xl border border-[#d7e3ff] bg-gradient-to-r from-[#e9f0ff] via-[#dce9ff] to-[#f4e8ff] p-6 shadow-[0_16px_40px_rgba(59,130,246,0.16)] md:p-8">
          <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#7aa2ff]/20 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-[#c084fc]/20 blur-3xl" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <div className="z-10 max-w-xl">
            <p className="mb-3 inline-flex rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">Bộ sưu tập tháng này</p>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Mùa đọc sách Thu Đông</h1>
            <p className="mb-6 text-base text-slate-700 sm:text-lg">Giảm giá đến 30% cho các tác phẩm kinh điển và sách mới phát hành. Cập nhật mỗi tuần để không bỏ lỡ tựa hot.</p>
            <button className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">Khám phá ngay</button>
          </div>
          <div className="relative h-48 overflow-hidden rounded-2xl border border-white/60 shadow-[0_12px_26px_rgba(15,23,42,0.18)] sm:h-56 md:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop" alt="Kệ sách" className="h-full w-full object-cover" />
          </div>
=======

import { useAuth } from '@/src/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { isSignedIn, user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/auth/login');
    }
  }, [isSignedIn, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-[#F5F0E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-[#FDFBF7] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              Book Management System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-[#666]">Welcome,</p>
              <p className="font-semibold text-[#1a1a1a]">{user?.fullName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#d32f2f] hover:bg-[#b71c1c] text-white rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#FDFBF7] rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">
            Welcome to BMS!
          </h2>
          <p className="text-[#666] mb-6">
            You have successfully logged in. This is your dashboard.
          </p>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#666]">Email</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666]">Username</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">
                  {user?.username}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666]">Role</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">
                  {user?.role}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666]">Status</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {user?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/books"
              className="p-4 bg-[#F5F0E8] hover:bg-indigo-100 rounded-lg border-2 border-[#D4C4B0] transition-colors"
            >
              <h4 className="font-semibold text-indigo-900 mb-2">Books</h4>
              <p className="text-sm text-[#1F4788]">Browse and manage books</p>
            </Link>
            <Link
              href="/orders"
              className="p-4 bg-[#F5F0E8] hover:bg-blue-100 rounded-lg border-2 border-[#D4C4B0] transition-colors"
            >
              <h4 className="font-semibold text-blue-900 mb-2">Orders</h4>
              <p className="text-sm text-[#1F4788]">View your orders</p>
            </Link>
            <Link
              href="/profile"
              className="p-4 bg-[#F5F0E8] hover:bg-purple-100 rounded-lg border-2 border-[#D4C4B0] transition-colors"
            >
              <h4 className="font-semibold text-purple-900 mb-2">Profile</h4>
              <p className="text-sm text-[#1F4788]">Manage your profile</p>
            </Link>
>>>>>>> e2df7d97f756621fb95d37380e2acba42abbb2c2
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sách nổi bật</h2>
            <p className="mt-1 text-sm text-slate-500">Hiển thị {filteredBooks.length} / {books.length} đầu sách</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            <span>Sắp xếp theo: Mới nhất</span>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Render danh sách sách / Trạng thái */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500 mb-4" />
            <p className="text-gray-500">Đang tải danh sách sách...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-500">
            {error}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-700">Không tìm thấy cuốn sách phù hợp</p>
            <p className="mt-2 text-sm text-slate-500">Hãy đổi bộ lọc hoặc khoảng giá để xem thêm kết quả.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => {
              const bookId = book.id;
              return (
                <Link href={`/detail/${bookId}`} key={bookId} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] sm:p-4">
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="relative mb-4 flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={book.image || book.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"} 
                      alt={book.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute bottom-0 left-0 w-full translate-y-full p-2 transition-transform duration-300 group-hover:translate-y-0">
                      <button onClick={(e) => {
                        e.preventDefault();
                        void handleAddToCart(bookId);
                      }}
                      disabled={addToCartLoading && pendingBookId === bookId}
                      className="w-full rounded-md bg-slate-900/90 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {addToCartLoading && pendingBookId === bookId ? 'Đang thêm...' : 'Thêm giỏ hàng'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-tight text-slate-900 sm:text-base">{book.title}</h3>
                    <p className="mb-2 text-xs text-slate-500">{book.author}</p>
                    
                    <div className="mb-3 flex items-center gap-1">
                      <Star size={14} fill="#facc15" stroke="none" />
                      <span className="text-xs font-medium text-slate-700">{String(book.rating ?? "5.0")}</span>
                      <span className="text-xs text-slate-400">({String(book.reviews?.length ?? "0")})</span>
                    </div>
                    
                    <div className="mt-auto flex items-end gap-2">
                      <span className="text-base font-bold text-slate-900 sm:text-lg">
                        {typeof book.price === 'number' ? `${book.price.toLocaleString('vi-VN')} đ` : book.price}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      </div>
      </div>
    </div>
  );
}


