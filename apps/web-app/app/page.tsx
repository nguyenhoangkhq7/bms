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
import { bookService } from '@/src/api/bookService'; 
import { categoryService } from '@/src/api/categoryService';
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

  return (
    <div className="w-full px-8 lg:px-20 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
            <div className="flex flex-col gap-2">
              {categories.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Đang tải danh mục...</p>
              ) : (
                  categories.map((parentCat) => {
                    const currentId = parentCat.id;
                    const isExpanded = expandedCategories.includes(currentId);
                    
                    return (
                        <div key={currentId} className="border-b border-gray-100 last:border-0 pb-2 mb-2">
                            {/* Nút danh mục cha */}
                            <button 
                                onClick={() => toggleCategoryExpand(currentId)}
                                className="w-full flex items-center justify-between text-left group py-1"
                            >
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-800 group-hover:text-black transition-colors">
                                    <span className="text-gray-400 group-hover:text-black">
                                        {getCategoryIcon(currentId)}
                                    </span>
                                    {parentCat.name}
                                </span>
                                {parentCat.subCategories && parentCat.subCategories.length > 0 && (
                                    <span className="text-gray-400 group-hover:text-black transition-colors">
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </span>
                                )}
                            </button>

                            {/* Danh sách danh mục con */}
                            <div 
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                              }`}
                            >
                              {parentCat.subCategories && parentCat.subCategories.length > 0 && (
                                  <div className="ml-6 flex flex-col gap-3 pb-2">
                                      {parentCat.subCategories.map((childCat) => {
                                        const childId = childCat.id;
                                        return (
                                          <label key={childId} className="flex items-center gap-3 cursor-pointer group">
                                              <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" 
                                                checked={selectedCategories.includes(childId)}
                                                onChange={() => toggleCategoryFilter(childId)}
                                              />
                                              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
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
            <h3 className="font-semibold text-gray-900 mb-4">Khoảng giá</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Từ" 
                className="w-full p-2 border rounded-md text-sm outline-none focus:border-black" 
              />
              <span className="text-gray-400">-</span>
              <input 
                type="number" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Đến" 
                className="w-full p-2 border rounded-md text-sm outline-none focus:border-black" 
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 mb-8 flex items-center justify-between overflow-hidden relative h-64">
          <div className="relative z-10 max-w-md">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4" style={{ color: '#ffffff' }}>Mùa Đọc Sách Thu Đông</h1>
            <p className="text-gray-300 mb-6">Giảm giá lên đến 30% cho các tác phẩm kinh điển và tiểu thuyết mới nhất.</p>
            <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">Khám phá ngay</button>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-50 md:opacity-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop" alt="Banner" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-serif" style={{ color: '#111827' }}>Sách Mới Nổi Bật</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-black">
            <span>Sắp xếp theo: Mới nhất</span>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Render danh sách sách / Trạng thái */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500 mb-4" />
            <p className="text-gray-500">Đang tải danh sách sách...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">
            Không tìm thấy cuốn sách nào trong danh mục đã chọn.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const bookId = book.id;
              return (
                <Link href={`/detail/${bookId}`} key={bookId} className="group bg-white p-4 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col relative">
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="w-full aspect-[2/3] overflow-hidden rounded-md mb-4 bg-gray-100 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={book.image || book.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute bottom-0 left-0 w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button onClick={(e) => {
                        e.preventDefault();
                        alert(`Đã thêm "${book.title}" vào giỏ hàng`);
                      }} className="w-full bg-black/90 text-white py-2 rounded-md text-sm font-semibold hover:bg-black backdrop-blur-sm">Thêm giỏ hàng</button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <h3 className="font-bold text-base line-clamp-2 leading-tight mb-1" style={{ color: '#111827' }}>{book.title}</h3>
                    <p className="text-gray-500 text-xs mb-2">{book.author}</p>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <Star size={14} fill="#facc15" stroke="none" />
                      <span className="text-xs font-medium text-gray-700">{String(book.rating ?? "5.0")}</span>
                      <span className="text-xs text-gray-400">({String(book.reviews?.length ?? "0")})</span>
                    </div>
                    
                    <div className="mt-auto flex items-end gap-2">
                      <span className="font-bold text-lg text-gray-900">
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
  );
}
