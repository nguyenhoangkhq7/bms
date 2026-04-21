'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bookService } from '@/src/api/bookService';
import { bookImageService } from '@/src/api/bookImageService';
import { categoryService } from '@/src/api/categoryService';
import type { Category } from '@/src/types';
import {
  BookOpen, Upload, Type, User, DollarSign, Layers,
  FileText, Image, CheckCircle, AlertCircle, ArrowLeft, Loader2,
  Package, Plus, X, Images, Building
} from 'lucide-react';

// Interface cho raw category từ API
interface RawCategory extends Category {
  parentId: number | null;
}

// Interface cho form data
interface BookForm {
  title: string;
  publisher: string;
  author: string;
  price: string;
  stockQuantity: string;
  description: string;
  imageUrl: string;
}

export default function AddBookPage() {
  const router = useRouter();

  const [allCategories, setAllCategories] = useState<RawCategory[]>([]);
  const [parentCategories, setParentCategories] = useState<RawCategory[]>([]);
  const [childCategories, setChildCategories] = useState<RawCategory[]>([]);
  const [selectedParentCat, setSelectedParentCat] = useState('');
  const [selectedChildCat, setSelectedChildCat] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<BookForm>({
    title: '',
    publisher: '',
    author: '',
    price: '',
    stockQuantity: '',
    description: '',
    imageUrl: ''
  });

  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);

  // Load categories and build parent/child tree
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories() as RawCategory[];
        setAllCategories(data);
        // Filter parent categories (parentId === null)
        const parents = data.filter(cat => cat.parentId === null);
        setParentCategories(parents);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  // When parent category changes, populate child categories
  useEffect(() => {
    if (selectedParentCat) {
      const children = allCategories.filter(cat => cat.parentId === Number(selectedParentCat));
      setChildCategories(children);
      setSelectedChildCat(''); // reset child selection
    } else {
      setChildCategories([]);
      setSelectedChildCat('');
    }
  }, [selectedParentCat, allCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate
    if (!form.title.trim()) { setError('Vui lòng nhập tên sách'); return; }
    if (!form.publisher.trim()) { setError('Vui lòng nhập nhà xuất bản'); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Vui lòng nhập giá hợp lệ'); return; }
    if (!form.stockQuantity || Number(form.stockQuantity) < 0) { setError('Vui lòng nhập số lượng tồn kho hợp lệ'); return; }
    if (!selectedParentCat) { setError('Vui lòng chọn danh mục'); return; }

    // Determine category
    const finalCategoryId = selectedChildCat ? Number(selectedChildCat) : Number(selectedParentCat);
    const finalParentCategoryId = selectedChildCat ? Number(selectedParentCat) : null;

    try {
      setLoading(true);
      const bookData = {
        title: form.title.trim(),
        publisher: form.publisher.trim(),
        author: form.author.trim() || null,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        status: 'AVAILABLE',
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        categoryId: finalCategoryId,
        parentCategoryId: finalParentCategoryId,
        category: { id: finalCategoryId }
      };

      // Step 1: Create book
      const createdBook = await bookService.createBook(bookData as never);

      // Step 2: Add secondary images one by one via POST /api/books/{bookId}/images
      const validSecondaryImages = secondaryImages.filter(url => url.trim());

      if (validSecondaryImages.length > 0 && createdBook?.id) {
        for (const imgUrl of validSecondaryImages) {
          await bookImageService.addImageToBook(createdBook.id, imgUrl.trim());
        }
      }

      setSuccess(true);
      setForm({ title: '', publisher: '', author: '', price: '', stockQuantity: '', description: '', imageUrl: '' });
      setSecondaryImages([]);
      setSelectedParentCat('');
      setSelectedChildCat('');

      // Redirect after success
      setTimeout(() => router.push('/'), 2000);
    } catch (err: unknown) {
      console.error('Lỗi tạo sách:', err);
      setError((err as Error).message || 'Có lỗi xảy ra khi thêm sách. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const pageStyle: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '32px 20px 60px'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px'
  };

  const backBtnStyle: React.CSSProperties = {
    width: '42px', height: '42px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
    padding: '32px',
    overflow: 'hidden'
  };

  const fieldGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '20px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '15px',
    fontFamily: 'inherit',
    color: '#1f2937',
    background: '#fafafa',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '40px'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '100px',
    lineHeight: '1.6'
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#7c3aed';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.background = '#fafafa';
    e.target.style.boxShadow = 'none';
  };

  const submitBtnStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '14px 24px',
    background: loading
      ? '#a78bfa'
      : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    color: '#fff',
    border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
    transition: 'all 0.2s ease',
    marginTop: '8px'
  };

  const alertStyle = (type: 'error' | 'success'): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 18px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    ...(type === 'error' ? {
      background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'
    } : {
      background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0'
    })
  });

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  };

  // Preview image
  const previewStyle: React.CSSProperties = {
    marginTop: '8px',
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb'
  };

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <button
          onClick={() => router.push('/')}
          style={backBtnStyle}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <ArrowLeft size={20} style={{ color: '#374151' }} />
        </button>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: '700', color: '#1e1b4b',
            margin: '0', letterSpacing: '-0.5px'
          }}>
            Thêm sách mới
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: '4px 0 0' }}>
            Điền thông tin sách để thêm vào hệ thống
          </p>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div style={alertStyle('error')}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div style={alertStyle('success')}>
          <CheckCircle size={18} />
          Thêm sách thành công! Đang chuyển về trang chủ...
        </div>
      )}

      {/* FORM CARD */}
      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>

          {/* Title */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <Type size={16} style={{ color: '#7c3aed' }} />
              Tên sách <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="VD: Đắc Nhân Tâm"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Publisher + Author row */}
          <div style={rowStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Building size={16} style={{ color: '#7c3aed' }} />
                Nhà xuất bản <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                placeholder="VD: NXB Trẻ"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <User size={16} style={{ color: '#7c3aed' }} />
                Tác giả
              </label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="VD: Dale Carnegie"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Price + Stock row */}
          <div style={rowStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <DollarSign size={16} style={{ color: '#7c3aed' }} />
                Giá (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="VD: 150000"
                min="0"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Package size={16} style={{ color: '#7c3aed' }} />
                Tồn kho <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={handleChange}
                placeholder="VD: 50"
                min="0"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Category - Parent */}
          <div style={rowStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Layers size={16} style={{ color: '#7c3aed' }} />
                Danh mục cha <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedParentCat}
                onChange={(e) => setSelectedParentCat(e.target.value)}
                style={selectStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">-- Chọn danh mục cha --</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category - Child (only show when parent is selected and has children) */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Layers size={16} style={{ color: '#a78bfa' }} />
                Danh mục con
                {childCategories.length > 0 && <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '400' }}>(tuỳ chọn)</span>}
              </label>
              <select
                value={selectedChildCat}
                onChange={(e) => setSelectedChildCat(e.target.value)}
                style={{
                  ...selectStyle,
                  opacity: childCategories.length === 0 ? 0.5 : 1,
                  cursor: childCategories.length === 0 ? 'not-allowed' : 'pointer'
                }}
                disabled={childCategories.length === 0}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">
                  {!selectedParentCat
                    ? '-- Chọn danh mục cha trước --'
                    : childCategories.length === 0
                      ? '-- Không có danh mục con --'
                      : '-- Chọn danh mục con --'}
                </option>
                {childCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL - Cover */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <Image size={16} style={{ color: '#7c3aed' }} />
              Ảnh bìa
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Dán URL hoặc chọn ảnh từ máy tính..."
                style={{ ...inputStyle, flex: 1 }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <input
                type="file"
                accept="image/*"
                id="cover-file-input"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('cover-file-input')?.click()}
                style={{
                  height: '46px', padding: '0 16px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  border: '2px solid #e5e7eb', borderRadius: '12px',
                  background: '#fff', color: '#6b7280',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.color = '#7c3aed';
                  e.currentTarget.style.background = '#f5f3ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <Upload size={14} />
                Chọn ảnh
              </button>
            </div>
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imageUrl}
                alt="Preview"
                style={previewStyle}
                onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                onLoad={(e) => (e.target as HTMLElement).style.display = 'block'}
              />
            )}
          </div>

          {/* Secondary Images */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <Images size={16} style={{ color: '#7c3aed' }} />
              Ảnh phụ (hiển thị phía dưới ảnh bìa)
            </label>

            {secondaryImages.map((url, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const updated = [...secondaryImages];
                      updated[index] = e.target.value;
                      setSecondaryImages(updated);
                    }}
                    placeholder={`Dán URL hoặc chọn ảnh phụ ${index + 1}...`}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id={`secondary-file-${index}`}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const updated = [...secondaryImages];
                          updated[index] = reader.result as string;
                          setSecondaryImages(updated);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById(`secondary-file-${index}`)?.click()}
                    style={{
                      height: '46px', padding: '0 14px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: '4px',
                      border: '2px solid #e5e7eb', borderRadius: '10px',
                      background: '#fff', color: '#6b7280',
                      cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#7c3aed';
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <Upload size={12} />
                    Chọn
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecondaryImages(secondaryImages.filter((_, i) => i !== index))}
                    style={{
                      width: '46px', height: '46px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #fecaca', borderRadius: '10px',
                      background: '#fef2f2', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                  >
                    <X size={16} style={{ color: '#ef4444' }} />
                  </button>
                </div>
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{ ...previewStyle, maxHeight: '120px', marginTop: '6px' }}
                    onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                    onLoad={(e) => (e.target as HTMLElement).style.display = 'block'}
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSecondaryImages([...secondaryImages, ''])}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '10px 16px',
                border: '2px dashed #d1d5db', borderRadius: '12px',
                background: '#f9fafb', color: '#6b7280',
                cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.color = '#7c3aed';
                e.currentTarget.style.background = '#f5f3ff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.background = '#f9fafb';
              }}
            >
              <Plus size={16} />
              Thêm ảnh phụ
            </button>
          </div>

          {/* Description */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <FileText size={16} style={{ color: '#7c3aed' }} />
              Mô tả
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về nội dung cuốn sách..."
              style={textareaStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={submitBtnStyle}
            onMouseEnter={e => {
              if (!loading) {
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.45)';
              }
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.35)';
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang thêm...
              </>
            ) : (
              <>
                <Upload size={20} />
                Thêm sách
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
