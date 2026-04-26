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
        </div>
      </div>
      </main>
        </div>
      </div>
    </div>
  );
}


