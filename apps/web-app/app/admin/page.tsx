'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookService } from '@/src/api/bookService';
import { categoryService } from '@/src/api/categoryService';
import type { Book, Category } from '@/src/types';
import {
  Library, Tag, AlertTriangle, DollarSign,
  Plus, BookOpen, TrendingUp, Package,
  ArrowUpRight, ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, catsData] = await Promise.all([
          bookService.getAllBooks(),
          categoryService.getAllCategories(),
        ]);
        setBooks(booksData || []);
        setCategories(catsData || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBooks = books.length;
  const totalCategories = categories.length;
  const lowStockBooks = books.filter(b => (b.stockQuantity ?? 0) <= 10);
  const totalStockValue = books.reduce((sum, b) => sum + (b.price * (b.stockQuantity ?? 0)), 0);
  const recentBooks = [...books].sort((a, b) => b.id - a.id).slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #e2e8f0',
          borderTopColor: '#1e293b', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tổng sách', value: totalBooks, icon: Library,
      color: '#3b82f6', bgColor: '#eff6ff', change: `${totalBooks} cuốn`,
    },
    {
      label: 'Danh mục', value: totalCategories, icon: Tag,
      color: '#10b981', bgColor: '#ecfdf5', change: `${categories.filter(c => !(c as any).parentId).length} danh mục cha`,
    },
    {
      label: 'Sắp hết hàng', value: lowStockBooks.length, icon: AlertTriangle,
      color: '#f59e0b', bgColor: '#fffbeb', change: 'Tồn kho ≤ 10',
      alert: lowStockBooks.length > 0,
    },
    {
      label: 'Giá trị kho', value: new Intl.NumberFormat('vi-VN').format(totalStockValue) + 'đ',
      icon: DollarSign, color: '#8b5cf6', bgColor: '#f5f3ff', change: 'Tổng giá trị',
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: '6px 0 0' }}>
          Tổng quan hệ thống quản lý sách BookHaven
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              background: '#fff', borderRadius: 16, padding: '24px 20px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'flex-start', gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: card.bgColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={22} style={{ color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, fontWeight: 500 }}>{card.label}</p>
                <p style={{
                  fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '4px 0 2px',
                  lineHeight: 1.1,
                }}>
                  {card.value}
                </p>
                <p style={{
                  fontSize: 12, margin: 0, fontWeight: 500,
                  color: card.alert ? '#f59e0b' : '#94a3b8',
                }}>
                  {card.alert && <AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: -1 }} />}
                  {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Books */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Sách gần đây
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
                  Sách mới thêm vào hệ thống
                </h3>
              </div>
              <Link href="/admin/books" style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 600, color: '#3b82f6', textDecoration: 'none',
              }}>
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div>
              {recentBooks.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  <BookOpen size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <p style={{ fontSize: 14, margin: 0 }}>Chưa có sách nào</p>
                </div>
              ) : (
                recentBooks.map((book, idx) => (
                  <div key={book.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 24px',
                    borderBottom: idx < recentBooks.length - 1 ? '1px solid #f8fafc' : 'none',
                    transition: 'background 0.15s',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.imageUrl || '/placeholder-book.png'}
                      alt={book.title}
                      style={{
                        width: 44, height: 60, objectFit: 'cover',
                        borderRadius: 6, background: '#f1f5f9', flexShrink: 0,
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 60"><rect fill="%23f1f5f9" width="44" height="60"/><text x="22" y="35" text-anchor="middle" fill="%2394a3b8" font-size="10">📖</text></svg>'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {book.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                        {book.author || 'Không rõ tác giả'} • {book.publisher || ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        {new Intl.NumberFormat('vi-VN').format(book.price)}đ
                      </p>
                      <p style={{
                        fontSize: 12, margin: '2px 0 0', fontWeight: 500,
                        color: (book.stockQuantity ?? 0) <= 10 ? '#f59e0b' : '#10b981',
                      }}>
                        Kho: {book.stockQuantity ?? 0}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Actions */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: 24,
          }}>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Thao tác nhanh
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0 16px' }}>
              Các tác vụ quản trị
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/add-book" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px', borderRadius: 12,
                background: '#10b981', color: '#fff',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.15s',
                boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
              }}>
                <Plus size={18} /> Thêm sách mới
              </Link>
              <Link href="/admin/books" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px', borderRadius: 12,
                background: '#3b82f6', color: '#fff',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.15s',
                boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
              }}>
                <Library size={18} /> Quản lý sách
              </Link>
              <Link href="/" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px', borderRadius: 12,
                border: '1px solid #e2e8f0', background: '#fff', color: '#475569',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.15s',
              }}>
                <ArrowUpRight size={18} /> Xem cửa hàng
              </Link>
            </div>
          </div>

          {/* Low Stock */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Sắp hết hàng
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
                  Cần nhập thêm
                </h3>
              </div>
              <Link href="/admin/books" style={{
                fontSize: 12, fontWeight: 600, color: '#3b82f6', textDecoration: 'none',
              }}>
                Xem tất cả
              </Link>
            </div>

            {lowStockBooks.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8' }}>
                <Package size={24} style={{ marginBottom: 6, opacity: 0.5 }} />
                <p style={{ fontSize: 13, margin: 0 }}>Tất cả sách đều đủ hàng 🎉</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lowStockBooks.slice(0, 5).map((book) => (
                  <div key={book.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.imageUrl || '/placeholder-book.png'}
                      alt={book.title}
                      style={{
                        width: 36, height: 48, objectFit: 'cover',
                        borderRadius: 6, background: '#f1f5f9', flexShrink: 0,
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48"><rect fill="%23f1f5f9" width="36" height="48"/></svg>'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {book.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#f59e0b', margin: '2px 0 0', fontWeight: 600 }}>
                        Còn {book.stockQuantity ?? 0} cuốn
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
