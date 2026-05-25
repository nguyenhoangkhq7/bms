'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  Search,
  ShoppingCart,
  User,
  Heart,
  LogOut,
  Shield,
  LayoutDashboard,
  Minus,
  Plus,
  X,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCart } from '@/src/cart/services/cartService';
import { useAuth } from '@/src/auth/context';
import { useWishlist } from '@/src/wishlist/context';
import { useAddToCart } from '@/src/cart/hooks/useAddToCart';
import { getEffectiveUserId } from '@/src/cart/utils/userContext';

export default function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isSignedIn, logout, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminRoute = pathname.startsWith('/admin');
  const { items: wishlistItems, removeItem: removeWishlistItem, count: wishlistCount } = useWishlist();
  const { addToCart, loading: addingToCart } = useAddToCart();
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlistQuantities, setWishlistQuantities] = useState<Record<number, number>>({});
  const wishlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const syncCartCount = async () => {
      try {
        const cart = await getCart();
        const total = (cart?.items ?? []).length;
        if (mounted) {
          setCartCount(total);
        }
      } catch {
        if (mounted) {
          setCartCount(0);
        }
      }
    };

    const onCartChanged = () => {
      void syncCartCount();
    };

    void syncCartCount();
    window.addEventListener('cart:changed', onCartChanged);

    return () => {
      mounted = false;
      window.removeEventListener('cart:changed', onCartChanged);
    };
  }, [pathname]);

  // Close wishlist dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wishlistRef.current && !wishlistRef.current.contains(e.target as Node)) {
        setWishlistOpen(false);
      }
    };
    if (wishlistOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wishlistOpen]);

  const getWishlistQty = (bookId: number) => wishlistQuantities[bookId] || 1;
  const setWishlistQty = (bookId: number, qty: number) => {
    setWishlistQuantities(prev => ({ ...prev, [bookId]: Math.max(1, qty) }));
  };

  const handleWishlistAddToCart = async (bookId: number) => {
    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }
    const userId = getEffectiveUserId();
    if (!userId) return;
    try {
      await addToCart({ userId, bookId, quantity: getWishlistQty(bookId) });
      removeWishlistItem(bookId);
      setWishlistQuantities(prev => {
        const copy = { ...prev };
        delete copy[bookId];
        return copy;
      });
    } catch {
      // error toast is handled by useAddToCart
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/');
    }
  };

  const handleAuthClick = async () => {
    if (isLoading) return;

    if (!isSignedIn) {
      router.push('/auth/login');
      return;
    }

    await logout();
    router.push('/auth/login');
  };

  const handleLogout = async () => {
    if (isLoading) return;

    await logout();
    router.push('/auth/login');
  };

  if (pathname.startsWith('/auth')) {
    return null;
  }

  if (isAdminRoute) {
    return null;
  }

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 border-b border-red-100 bg-white/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-8 py-4 lg:px-20">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl"
          >
            <BookOpen size={30} strokeWidth={2.5} />
            <span className="font-serif">BookHaven Admin</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/admin"
              className="hidden items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 sm:flex"
            >
              <LayoutDashboard size={16} />
              Bảng điều khiển
            </Link>

            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs text-gray-500">Xin chào,</span>
                <span className="text-sm font-bold text-gray-900">
                  {user?.fullName || user?.username}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-red-600" />
                <span className="text-sm font-semibold text-red-600">Admin</span>
              </div>
            </div>

            <button
              onClick={logout}
              disabled={isLoading}
              title="Thoát"
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={18} />
              <span className="hidden sm:block">Đăng xuất</span>
            </button>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-[#f6f5f3]/95 backdrop-blur">
      <div className="flex w-full flex-col items-center justify-between gap-4 px-8 py-4 lg:flex-row lg:gap-8 lg:px-20">
        <div className="flex w-full flex-1 items-center justify-between gap-3 lg:gap-8">
          <Link
            href="/"
            onClick={() => window.dispatchEvent(new Event('clearFilters'))}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl"
          >
            <BookOpen size={30} strokeWidth={2.5} />
            <span className="font-serif">BookHaven</span>
          </Link>

          {!isAdmin && (
            <form
              onSubmit={handleSearch}
              className="relative hidden max-w-2xl flex-1 lg:block"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm hybrid: tiêu đề, tác giả, nội dung..."
                className="w-full rounded-full border border-gray-300 bg-white py-3 pl-5 pr-12 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-black"
              >
                <Search size={20} />
              </button>
            </form>
          )}

          <nav className="flex items-center gap-3 text-gray-700 sm:gap-5">
            <div className="hidden items-center gap-6 text-sm font-medium xl:flex">
              <Link
                href="/"
                onClick={() => window.dispatchEvent(new Event('clearFilters'))}
                className="transition-colors hover:text-black"
              >
                Trang chủ
              </Link>
              <Link href="/order" className="transition-colors hover:text-black">
                Đơn hàng
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 transition-colors hover:text-black"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  <Shield size={16} />
                  Quản lý
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-gray-300 pl-3 sm:gap-5 sm:pl-5">
              <div ref={wishlistRef} className="relative">
                <button
                  onClick={() => setWishlistOpen(prev => !prev)}
                  className="relative transition-colors hover:text-black"
                  title="Danh sách yêu thích"
                >
                  <Heart
                    size={20}
                    fill={wishlistCount > 0 ? '#ef4444' : 'none'}
                    stroke={wishlistCount > 0 ? '#ef4444' : 'currentColor'}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* Wishlist Dropdown */}
                {wishlistOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 12px)',
                      width: '420px',
                      maxHeight: '520px',
                      background: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                      zIndex: 100,
                      overflow: 'hidden',
                      animation: 'wishlistSlideIn 0.2s ease-out',
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={18} fill="#ef4444" stroke="#ef4444" />
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                          Yêu thích
                        </span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#ef4444',
                          background: '#fee2e2',
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}>
                          {wishlistCount}
                        </span>
                      </div>
                      <button
                        onClick={() => setWishlistOpen(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          padding: '4px',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#f3f4f6';
                          e.currentTarget.style.color = '#374151';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = '#9ca3af';
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Items */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 0' }}>
                      {wishlistItems.length === 0 ? (
                        <div style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: '#9ca3af',
                        }}>
                          <Heart size={36} stroke="#d1d5db" style={{ margin: '0 auto 12px' }} />
                          <p style={{ fontSize: '15px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px' }}>
                            Chưa có sách yêu thích
                          </p>
                          <p style={{ fontSize: '13px', margin: '0' }}>
                            Nhấn biểu tượng ❤️ để thêm sách vào danh sách
                          </p>
                        </div>
                      ) : (
                        wishlistItems.map(item => (
                          <div
                            key={item.bookId}
                            style={{
                              display: 'flex',
                              gap: '12px',
                              padding: '12px 20px',
                              transition: 'background 0.15s ease',
                              alignItems: 'flex-start',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {/* Book Image */}
                            <Link
                              href={`/detail/${item.bookId}`}
                              onClick={() => setWishlistOpen(false)}
                              style={{
                                width: '56px',
                                height: '72px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl || 'https://via.placeholder.com/56x72'}
                                alt={item.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Link>

                            {/* Book Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Link
                                href={`/detail/${item.bookId}`}
                                onClick={() => setWishlistOpen(false)}
                                style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  textDecoration: 'none',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: '1.3',
                                  marginBottom: '2px',
                                }}
                              >
                                {item.title}
                              </Link>
                              <p style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                margin: '0 0 6px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                                {item.author}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#b45309',
                                margin: '0 0 8px',
                              }}>
                                {item.price?.toLocaleString()} đ
                              </p>

                              {/* Quantity + Actions */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Quantity Selector */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#fff',
                                }}>
                                  <button
                                    onClick={() => setWishlistQty(item.bookId, getWishlistQty(item.bookId) - 1)}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      border: 'none',
                                      background: '#f9fafb',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#374151',
                                      transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span style={{
                                    width: '32px',
                                    textAlign: 'center',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                  }}>
                                    {getWishlistQty(item.bookId)}
                                  </span>
                                  <button
                                    onClick={() => setWishlistQty(item.bookId, getWishlistQty(item.bookId) + 1)}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      border: 'none',
                                      background: '#f9fafb',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#374151',
                                      transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                {/* Add to Cart */}
                                <button
                                  onClick={() => handleWishlistAddToCart(item.bookId)}
                                  disabled={addingToCart}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 10px',
                                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: addingToCart ? 'not-allowed' : 'pointer',
                                    opacity: addingToCart ? 0.7 : 1,
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onMouseEnter={e => {
                                    if (!addingToCart) {
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(124, 58, 237, 0.35)';
                                    }
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(124, 58, 237, 0.25)';
                                  }}
                                >
                                  <ShoppingCart size={12} />
                                  Thêm giỏ hàng
                                </button>

                                {/* Remove */}
                                <button
                                  onClick={() => removeWishlistItem(item.bookId)}
                                  title="Xóa khỏi yêu thích"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'none',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    transition: 'all 0.15s ease',
                                    flexShrink: 0,
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#fef2f2';
                                    e.currentTarget.style.borderColor = '#f87171';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.borderColor = '#fecaca';
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Animation */}
                <style>{`
                  @keyframes wishlistSlideIn {
                    from {
                      opacity: 0;
                      transform: translateY(-8px) scale(0.97);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0) scale(1);
                    }
                  }
                `}</style>
              </div>
              <Link href="/cart" className="relative transition-colors hover:text-black">
                <ShoppingCart size={20} />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                  {cartCount}
                </span>
              </Link>
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-xs text-gray-500">Xin chào,</span>
                    <span className="text-sm font-bold text-gray-900">{user?.fullName || user?.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/profile"
                      title="Hồ sơ cá nhân"
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#1F4788]"
                    >
                      <User size={20} />
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      title="Thoát"
                      className="p-2 rounded-full hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600 disabled:opacity-60"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  disabled={isLoading}
                  className="flex items-center gap-2 transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <User size={20} />
                  <span className="hidden text-sm font-medium sm:block">
                    Đăng nhập
                  </span>
                </button>
              )}
            </div>
          </nav>
        </div>

        {!isAdmin && (
          <form onSubmit={handleSearch} className="relative w-full lg:hidden">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm hybrid: tiêu đề, tác giả, nội dung..."
              className="w-full rounded-full border border-gray-300 bg-white py-3 pl-5 pr-12 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-black"
            >
              <Search size={20} />
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
