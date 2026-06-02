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
  Loader2,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { bookService } from '@/src/api/bookService'; 
import { categoryService } from '@/src/api/categoryService';

import { useAddToCart } from '@/src/cart/hooks/useAddToCart';
import { getEffectiveUserId } from '@/src/cart/utils/userContext';
import { useAuth } from '@/src/auth/context';
import { useRouter } from 'next/navigation';

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
  const searchQuery = (searchParams.get('search') || '').trim();
  const refreshToken = searchParams.get('updated');
  const SEARCH_PAGE_SIZE = 10;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(false);
  const [loadingMoreSearchResults, setLoadingMoreSearchResults] = useState(false);

  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pendingBookId, setPendingBookId] = useState<number | null>(null);

  const { addToCart, loading: addToCartLoading } = useAddToCart();
  const { isSignedIn, user } = useAuth();
  const router = useRouter();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async <T,>(loader: () => Promise<T>, attempts = 3) => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await loader();
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await delay(750 * attempt);
        }
      }
    }

    throw lastError;
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
  };

  const getAllowedCategoryIds = () => {
    const allowedCategoryIds = new Set<number>(selectedCategories);

    selectedCategories.forEach((id) => {
      const category = categories.find((item) => item.id === id);
      if (category?.subCategories?.length) {
        category.subCategories.forEach((subCategory) => allowedCategoryIds.add(subCategory.id));
      }
    });

    return Array.from(allowedCategoryIds);
  };

  useEffect(() => {
    const handleClearFilters = () => {
      clearFilters();
    };
    window.addEventListener('clearFilters', handleClearFilters);
    return () => window.removeEventListener('clearFilters', handleClearFilters);
  }, []);

  useEffect(() => {
    if (isSignedIn && user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [isSignedIn, user, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const rawCategories = await fetchWithRetry(() => categoryService.getAllCategories()) as RawCategory[];
        const parentCategories = rawCategories.filter((cat) => cat.parentId === null);

        const treeCategories: TreeCategory[] = parentCategories.map((parent) => ({
          ...parent,
          subCategories: rawCategories.filter((child) => child.parentId === parent.id),
        }));

        setCategories(treeCategories);

        if (treeCategories.length > 0) {
          setExpandedCategories(treeCategories.slice(0, 3).map((category) => category.id));
        }
      } catch (err) {
        console.error('[HOME] Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAllBooks = async () => {
      if (searchQuery) return;

      try {
        console.log('[HOME] useEffect triggered with refreshToken:', refreshToken);
        setLoading(true);
        setHasMoreSearchResults(false);
        const data = await fetchWithRetry(() => bookService.getAllBooks());
        setBooks(data);
      } catch (err) {
        console.error('[HOME] Error fetching books:', err);
        setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllBooks();
  }, [refreshToken, searchQuery]);

  useEffect(() => {
    const fetchSearchBooks = async () => {
      if (!searchQuery) return;

      try {
        setLoading(true);
        setError(null);
        setHasMoreSearchResults(false);
        const categoryIdsCsv = getAllowedCategoryIds().join(',');
        const data = await fetchWithRetry(() =>
          bookService.hybridSearchBooks(searchQuery, SEARCH_PAGE_SIZE, 0, {
            categoryIdsCsv: categoryIdsCsv || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          }),
        );

        setHasMoreSearchResults(data.length === SEARCH_PAGE_SIZE);
        setBooks(data);
      } catch (err) {
        console.error('[HOME] Error fetching books:', err);
        setError('Lỗi khi tìm kiếm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchBooks();
  }, [searchQuery, selectedCategories, minPrice, maxPrice, categories]);

  if (isSignedIn && user?.role === 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#1F4788]" />
          <p className="text-sm font-medium text-[#666]">Đang chuyển đến trang quản lý...</p>
        </div>
      </div>
    );
  }

  const handleLoadMoreSearchResults = async () => {
    if (!searchQuery || loadingMoreSearchResults || !hasMoreSearchResults) return;

    try {
      setLoadingMoreSearchResults(true);
      const nextOffset = books.length;
      const categoryIdsCsv = getAllowedCategoryIds().join(',');
      const nextPage = await fetchWithRetry(() =>
        bookService.hybridSearchBooks(searchQuery, SEARCH_PAGE_SIZE, nextOffset, {
          categoryIdsCsv: categoryIdsCsv || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        }),
      );

      setBooks((currentBooks) => [...currentBooks, ...nextPage]);
      setHasMoreSearchResults(nextPage.length === SEARCH_PAGE_SIZE);
    } catch (err) {
      console.error('[HOME] Error loading more search results:', err);
      toast.error('Không thể tải thêm kết quả tìm kiếm.');
    } finally {
      setLoadingMoreSearchResults(false);
    }
  };

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
    // Lọc theo danh mục chỉ áp dụng cho chế độ không search.
    if (searchQuery) {
      return true;
    }

    // Lọc theo danh mục
    const catId = book.category?.id || book.categoryId;
    
    // Nếu chọn danh mục cha, bao gồm cả danh mục con của nó
    const allowedCategoryIds = new Set(getAllowedCategoryIds());

    const matchCategory = selectedCategories.length === 0 || allowedCategoryIds.has(catId) || allowedCategoryIds.has(book.parentCategoryId as number || book.category?.parentId as number);

    const matchSearch = true;
    const isNotDeleted = !book.isDeleted;

    // Lọc theo khoảng giá
    const price = Number(book.price) || 0;
    const minP = minPrice ? Number(minPrice) : 0;
    const maxP = maxPrice ? Number(maxPrice) : Infinity;
    const matchPrice = price >= minP && price <= maxP;

    return matchCategory && matchSearch && matchPrice && isNotDeleted;
  });

  const hasActiveFilters = selectedCategories.length > 0 || Boolean(minPrice) || Boolean(maxPrice);

  const handleAddToCart = async (bookId: number) => {
    if (!isSignedIn) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/auth/login');
      return;
    }

    const userId = getEffectiveUserId();
    if (!userId) return;

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
          
          <div className="mb-7 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            <div className="flex flex-col gap-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Đang tải danh mục...</p>
              ) : (
                categories.map((parentCat) => {
                  const currentId = parentCat.id;
                  const isExpanded = expandedCategories.includes(currentId);

                  return (
                    <div key={currentId} className="mb-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2 last:mb-0">
                      <div className="group flex w-full items-center justify-between py-1 text-left">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-700" 
                            checked={selectedCategories.includes(currentId)}
                            onChange={() => toggleCategoryFilter(currentId)}
                          />
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors group-hover:text-slate-950">
                            <span className="text-slate-400 transition-colors group-hover:text-slate-700">
                              {getCategoryIcon(currentId)}
                            </span>
                            {parentCat.name}
                          </span>
                        </label>
                        {parentCat.subCategories && parentCat.subCategories.length > 0 && (
                          <button
                            onClick={() => toggleCategoryExpand(currentId)}
                            className="p-1 text-slate-400 transition-colors hover:bg-slate-200 rounded group-hover:text-slate-700"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        )}
                      </div>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? 'mt-3 max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'
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
        </div>
      </div>

        {/* Book Listing Section */}
        <div className="mt-7">
          {/* Section Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {searchQuery ? `Kết quả tìm kiếm "${searchQuery}"` : 'Tất cả sách'}
              {!loading && <span className="ml-2 text-sm font-normal text-slate-500">({filteredBooks.length} cuốn)</span>}
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-slate-400" />
              <p className="text-sm text-slate-500">Đang tải danh sách sách...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <BookOpen className="mb-4 h-16 w-16 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold text-slate-700">Không tìm thấy sách</h3>
              <p className="text-sm text-slate-500">
                {hasActiveFilters || searchQuery 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' 
                  : 'Chưa có sách nào trong hệ thống.'}
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters} 
                  className="mt-4 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          )}

          {/* Book Grid */}
          {!loading && !error && filteredBooks.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredBooks.map((book) => {
                const bookImage = book.imageUrl || book.image || (book.images && book.images.length > 0 ? book.images[0].imageUrl : null);
                const bookRating = book.rating ?? (book.reviews && book.reviews.length > 0 
                  ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length) 
                  : 0);
                const categoryName = book.category?.name || '';

                return (
                  <div
                    key={book.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)]"
                  >
                    {/* Book Image */}
                    <Link href={`/detail/${book.id}`} className="relative block aspect-[3/4] overflow-hidden bg-slate-100">
                      {bookImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bookImage}
                          alt={book.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <BookOpen className="h-12 w-12 text-slate-300" />
                        </div>
                      )}
                      {/* Category Badge */}
                      {categoryName && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
                          {categoryName}
                        </span>
                      )}
                    </Link>

                    {/* Book Info */}
                    <div className="flex flex-1 flex-col p-3.5">
                      <Link href={`/detail/${book.id}`}>
                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition-colors hover:text-slate-950">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="mb-2 text-xs text-slate-500">{book.author}</p>

                      {/* Rating */}
                      {bookRating > 0 && (
                        <div className="mb-2 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < Math.round(bookRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                          <span className="ml-1 text-[10px] text-slate-400">
                            ({book.reviews?.length || 0})
                          </span>
                        </div>
                      )}

                      {/* Price + Add to Cart */}
                      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                        <div>
                          <p className="text-base font-bold text-slate-900">
                            {Number(book.price).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(book.id);
                          }}
                          disabled={addToCartLoading && pendingBookId === book.id}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          title="Thêm vào giỏ hàng"
                        >
                          {addToCartLoading && pendingBookId === book.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <span className="text-sm font-bold">+</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery && filteredBooks.length > 0 && (
            <div className="mt-8 flex justify-center">
              {hasMoreSearchResults ? (
                <button
                  onClick={handleLoadMoreSearchResults}
                  disabled={loadingMoreSearchResults}
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMoreSearchResults ? 'Đang tải thêm...' : 'Hiển thị thêm kết quả'}
                </button>
              ) : (
                <p className="text-sm text-slate-500">Đã hiển thị hết kết quả phù hợp.</p>
              )}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
    </div>
  );
}


