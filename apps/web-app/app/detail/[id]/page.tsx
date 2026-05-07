'use client';

import { Star, ShoppingCart, Heart, ChevronRight, User, Send, BookOpen, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { bookService } from '@/src/api/bookService';
import { useAddToCart } from '@/src/cart/hooks/useAddToCart';
import { getEffectiveUserId } from '@/src/cart/utils/userContext';
import type { Book } from '@/src/types';

interface ReviewItem {
  id: number;
  content: string;
  rating: number;
  userName?: string;
}

export default function DetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToCart, loading: addToCartLoading } = useAddToCart();

  // LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await bookService.getBookById(Number(id));
        setBook(data);
        setReviews((data?.reviews as unknown as ReviewItem[]) || []);
      } catch (err) {
        console.error("Lỗi load detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ADD REVIEW
  const handleSubmitReview = () => {
    if (!newReview.trim()) return;

    const fakeReview: ReviewItem = {
      id: Date.now(),
      content: newReview,
      rating: rating,
      userName: "Bạn"
    };

    setReviews([fakeReview, ...reviews]);
    setNewReview('');
    setRating(5);
  };

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #7c3aed',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Đang tải thông tin sách...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!book) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <BookOpen size={48} style={{ color: '#9ca3af' }} />
      <p style={{ color: '#6b7280', fontSize: '18px' }}>Không tìm thấy sách</p>
      <button
        onClick={() => router.push('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '8px',
          background: '#7c3aed', color: '#fff', border: 'none',
          cursor: 'pointer', fontSize: '14px', fontWeight: '500'
        }}
      >
        <ArrowLeft size={16} /> Về trang chủ
      </button>
    </div>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleAddToCart = async () => {
    const userId = getEffectiveUserId();
    if (!userId || !book?.id) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    await addToCart({
      userId,
      bookId: book.id,
      quantity,
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 60px' }}>

      {/* BREADCRUMB */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '14px', color: '#9ca3af', marginBottom: '28px'
      }}>
        <span
          onClick={() => router.push('/')}
          style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: '500' }}
          onMouseEnter={e => (e.target as HTMLElement).style.textDecoration = 'underline'}
          onMouseLeave={e => (e.target as HTMLElement).style.textDecoration = 'none'}
        >
          Trang chủ
        </span>
        <ChevronRight size={14} />
        <span
          onClick={() => router.push('/')}
          style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: '500' }}
          onMouseEnter={e => (e.target as HTMLElement).style.textDecoration = 'underline'}
          onMouseLeave={e => (e.target as HTMLElement).style.textDecoration = 'none'}
        >
          {book.category?.name || 'Sách'}
        </span>
        <ChevronRight size={14} />
        <span style={{ color: '#6b7280' }}>{book.title}</span>
      </nav>

      {/* MAIN CONTENT - TWO COLUMNS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 400px) 1fr',
        gap: '48px',
        marginBottom: '48px',
        alignItems: 'start'
      }}>

        {/* LEFT - IMAGE */}
        <div style={{
          position: 'sticky',
          top: '24px'
        }}>
          {/* MAIN IMAGE DISPLAY */}
          <div style={{
            background: 'linear-gradient(145deg, #f8f7ff 0%, #ede9fe 50%, #ddd6fe 100%)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.08)',
            minHeight: '320px'
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage || book.imageUrl || "https://via.placeholder.com/300x400"}
              alt={book.title}
              style={{
                maxWidth: '100%',
                maxHeight: '480px',
                borderRadius: '10px',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.03)'}
              onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}
            />
          </div>

          {/* THUMBNAIL STRIP */}
          {(() => {
            const allImages = [
              { imageUrl: book.imageUrl, id: 'cover' as string | number },
              ...(book.secondaryImages || [])
            ].filter(img => img.imageUrl);

            if (allImages.length <= 1) return null;

            return (
              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '14px',
                overflowX: 'auto',
                paddingBottom: '4px'
              }}>
                {allImages.map((img, index) => {
                  const isActive = (selectedImage || book.imageUrl) === img.imageUrl;
                  return (
                    <div
                      key={img.id || index}
                      onClick={() => setSelectedImage(img.imageUrl ?? null)}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: isActive ? '3px solid #7c3aed' : '2px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        background: '#f9fafb',
                        boxShadow: isActive ? '0 2px 8px rgba(124, 58, 237, 0.2)' : 'none'
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = '#a78bfa';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.imageUrl}
                        alt={index === 0 ? 'Ảnh bìa' : `Ảnh ${index}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* RIGHT - INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* BADGES ROW */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
              color: '#6d28d9',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.3px'
            }}>
              <BookOpen size={14} />
              {book.category?.name || "Không rõ thể loại"}
            </span>

            {book.author && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px',
                background: '#f3f4f6', color: '#4b5563',
                fontSize: '13px', fontWeight: '500'
              }}>
                <User size={14} />
                Tác giả: <strong style={{ color: '#111827' }}>{book.author}</strong>
              </span>
            )}

            {book.publisher && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px',
                background: '#f3f4f6', color: '#4b5563',
                fontSize: '13px', fontWeight: '500'
              }}>
                <BookOpen size={14} />
                NXB: <strong style={{ color: '#111827' }}>{book.publisher}</strong>
              </span>
            )}
          </div>

          {/* TITLE */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e1b4b',
            margin: '0',
            lineHeight: '1.3',
            letterSpacing: '-0.5px'
          }}>
            {book.title}
          </h1>

          {/* RATING SUMMARY */}
          {reviews.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {[1,2,3,4,5].map(star => (
                  <Star
                    key={star}
                    size={18}
                    fill={star <= Math.round(Number(avgRating)) ? "#f59e0b" : "#e5e7eb"}
                    stroke="none"
                  />
                ))}
              </div>
              <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '16px' }}>{avgRating}</span>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>({reviews.length} đánh giá)</span>
            </div>
          )}

          {/* PRICE */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <span style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#b45309',
              letterSpacing: '-0.5px'
            }}>
              {book.price?.toLocaleString()} đ
            </span>
          </div>

          {/* DESCRIPTION */}
          {book.description && (
            <div style={{
              padding: '16px 20px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Mô tả
              </h3>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#4b5563', margin: '0' }}>
                {book.description}
              </p>
            </div>
          )}

          {/* QUANTITY + ACTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Số lượng:</span>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '2px solid #e5e7eb', borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '40px', height: '40px',
                    border: 'none', background: '#f9fafb',
                    cursor: 'pointer', fontSize: '18px',
                    color: '#374151', fontWeight: '600',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >−</button>
                <span style={{
                  width: '48px', textAlign: 'center',
                  fontSize: '16px', fontWeight: '600', color: '#1f2937'
                }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '40px', height: '40px',
                    border: 'none', background: '#f9fafb',
                    cursor: 'pointer', fontSize: '18px',
                    color: '#374151', fontWeight: '600',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => void handleAddToCart()}
                disabled={addToCartLoading}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#fff',
                  border: 'none', borderRadius: '12px',
                  fontSize: '16px', fontWeight: '600',
                  cursor: addToCartLoading ? 'not-allowed' : 'pointer',
                  opacity: addToCartLoading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  if (addToCartLoading) return;
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.45)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.35)';
                }}
              >
                <ShoppingCart size={20} />
                {addToCartLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                style={{
                  width: '52px', height: '52px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid',
                  borderColor: isWishlisted ? '#ef4444' : '#e5e7eb',
                  borderRadius: '12px',
                  background: isWishlisted ? '#fef2f2' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <Heart
                  size={22}
                  fill={isWishlisted ? '#ef4444' : 'none'}
                  stroke={isWishlisted ? '#ef4444' : '#9ca3af'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #d1d5db, transparent)',
        margin: '0 0 40px'
      }} />

      {/* REVIEW SECTION */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <h2 style={{
          fontSize: '24px', fontWeight: '700', color: '#1e1b4b',
          margin: '0 0 24px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Star size={24} fill="#f59e0b" stroke="none" />
          Đánh giá & Nhận xét
          {reviews.length > 0 && (
            <span style={{
              fontSize: '14px', fontWeight: '500',
              color: '#7c3aed',
              background: '#ede9fe',
              padding: '4px 12px',
              borderRadius: '20px'
            }}>
              {reviews.length}
            </span>
          )}
        </h2>

        {/* REVIEW FORM */}
        <div style={{
          padding: '24px',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          marginBottom: '32px'
        }}>
          <p style={{
            fontSize: '15px', fontWeight: '600', color: '#374151',
            margin: '0 0 12px'
          }}>
            Đánh giá của bạn
          </p>

          {/* Star Rating */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: '2px',
                  transition: 'transform 0.15s ease',
                  transform: (hoverRating >= star || (!hoverRating && rating >= star)) ? 'scale(1.15)' : 'scale(1)'
                }}
              >
                <Star
                  size={28}
                  fill={(hoverRating ? hoverRating >= star : rating >= star) ? "#f59e0b" : "#e5e7eb"}
                  stroke="none"
                />
              </button>
            ))}
            <span style={{
              fontSize: '14px', color: '#6b7280',
              marginLeft: '8px',
              alignSelf: 'center'
            }}>
              {hoverRating || rating}/5
            </span>
          </div>

          {/* Textarea */}
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
            rows={4}
            style={{
              width: '100%',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              color: '#1f2937',
              background: '#fafafa'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7c3aed';
              e.target.style.background = '#fff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = '#fafafa';
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              onClick={handleSubmitReview}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px',
                background: newReview.trim()
                  ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                  : '#e5e7eb',
                color: newReview.trim() ? '#fff' : '#9ca3af',
                border: 'none', borderRadius: '10px',
                fontSize: '15px', fontWeight: '600',
                cursor: newReview.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                boxShadow: newReview.trim() ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
              }}
            >
              <Send size={16} />
              Gửi đánh giá
            </button>
          </div>
        </div>

        {/* REVIEW LIST */}
        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
            background: '#f9fafb',
            borderRadius: '16px',
            border: '2px dashed #e5e7eb'
          }}>
            <Star size={36} stroke="#d1d5db" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px', color: '#6b7280' }}>
              Chưa có đánh giá nào
            </p>
            <p style={{ fontSize: '14px', margin: '0' }}>
              Hãy là người đầu tiên đánh giá cuốn sách này!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{
                padding: '20px',
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid #e5e7eb',
                transition: 'box-shadow 0.2s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={18} stroke="#fff" />
                  </div>
                  <div>
                    <span style={{
                      fontWeight: '600', color: '#1f2937',
                      fontSize: '15px', display: 'block'
                    }}>
                      {r.userName || "Ẩn danh"}
                    </span>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                      {[1,2,3,4,5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= r.rating ? "#f59e0b" : "#e5e7eb"}
                          stroke="none"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: '15px', lineHeight: '1.7',
                  color: '#4b5563', margin: '0',
                  paddingLeft: '52px'
                }}>
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESPONSIVE STYLE OVERRIDE */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          div[style*="position: sticky"] {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
