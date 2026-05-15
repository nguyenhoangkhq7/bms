'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { bookService } from '@/src/api/bookService';
import { bookImageService } from '@/src/api/bookImageService';
import { categoryService } from '@/src/api/categoryService';
import type { Category } from '@/src/types';
import {
  Type, User, DollarSign, Layers, FileText, Image,
  CheckCircle, AlertCircle, ArrowLeft, Loader2,
  Package, Building, Save, Upload, Plus, X, Images
} from 'lucide-react';

interface RawCategory extends Category {
  parentId: number | null;
}

interface BookForm {
  title: string;
  publisher: string;
  author: string;
  price: string;
  stockQuantity: string;
  description: string;
  imageUrl: string;
}

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookId = Number(resolvedParams.id);
  const router = useRouter();

  const [allCategories, setAllCategories] = useState<RawCategory[]>([]);
  const [parentCategories, setParentCategories] = useState<RawCategory[]>([]);
  const [childCategories, setChildCategories] = useState<RawCategory[]>([]);
  const [selectedParentCat, setSelectedParentCat] = useState('');
  const [selectedChildCat, setSelectedChildCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<BookForm>({
    title: '', publisher: '', author: '', price: '',
    stockQuantity: '', description: '', imageUrl: ''
  });

  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);

  // Load book data + categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookData, catsData] = await Promise.all([
          bookService.getBookById(bookId),
          categoryService.getAllCategories() as Promise<RawCategory[]>,
        ]);

        if (!bookData) {
          setError('Không tìm thấy sách');
          setLoading(false);
          return;
        }

        // Set categories
        setAllCategories(catsData);
        const parents = catsData.filter(c => c.parentId === null);
        setParentCategories(parents);

        // Set form data
        setForm({
          title: bookData.title || '',
          publisher: bookData.publisher || '',
          author: bookData.author || '',
          price: String(bookData.price || ''),
          stockQuantity: String(bookData.stockQuantity ?? ''),
          description: bookData.description || '',
          imageUrl: bookData.imageUrl || '',
        });

        // Determine parent/child category
        const bookCatId = bookData.categoryId || bookData.category?.id;
        if (bookCatId) {
          const bookCat = catsData.find(c => c.id === bookCatId);
          if (bookCat) {
            if (bookCat.parentId) {
              // It's a child category
              setSelectedParentCat(String(bookCat.parentId));
              setSelectedChildCat(String(bookCat.id));
              const children = catsData.filter(c => c.parentId === bookCat.parentId);
              setChildCategories(children);
            } else {
              // It's a parent category
              setSelectedParentCat(String(bookCat.id));
              const children = catsData.filter(c => c.parentId === bookCat.id);
              setChildCategories(children);
            }
          }
        }

        // Load secondary images
        try {
          const images = await bookImageService.getImagesByBookId(bookId);
          setSecondaryImages(images.map(img => img.imageUrl));
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Error loading book:', err);
        setError('Lỗi khi tải dữ liệu sách');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookId]);

  // When parent category changes
  useEffect(() => {
    if (selectedParentCat && allCategories.length > 0) {
      const children = allCategories.filter(c => c.parentId === Number(selectedParentCat));
      setChildCategories(children);
    } else {
      setChildCategories([]);
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

    if (!form.title.trim()) { setError('Vui lòng nhập tên sách'); return; }
    if (!form.publisher.trim()) { setError('Vui lòng nhập nhà xuất bản'); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Vui lòng nhập giá hợp lệ'); return; }
    if (!form.stockQuantity || Number(form.stockQuantity) < 0) { setError('Vui lòng nhập tồn kho hợp lệ'); return; }
    if (!selectedParentCat) { setError('Vui lòng chọn danh mục'); return; }

    const finalCategoryId = selectedChildCat ? Number(selectedChildCat) : Number(selectedParentCat);
    const finalParentCategoryId = selectedChildCat ? Number(selectedParentCat) : null;

    try {
      setSaving(true);
      const bookData = {
        title: form.title.trim(),
        publisher: form.publisher.trim(),
        author: form.author.trim() || null,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        categoryId: finalCategoryId,
        parentCategoryId: finalParentCategoryId,
        category: { id: finalCategoryId },
      };

      await bookService.updateBook(bookId, bookData as never);
      setSuccess(true);
      setTimeout(() => router.push('/admin/books'), 2000);
    } catch (err: unknown) {
      console.error('Error updating book:', err);
      setError((err as Error).message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#1e293b';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(30, 41, 59, 0.08)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background = '#f8fafc';
    e.target.style.boxShadow = 'none';
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '2px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit',
    color: '#1e293b', background: '#f8fafc', outline: 'none',
    transition: 'all 0.2s ease', boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle, appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 600, color: '#374151',
    display: 'flex', alignItems: 'center', gap: 8,
  };

  const fieldGroupStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20,
  };

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

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => router.push('/admin/books')}
          style={{
            width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} style={{ color: '#374151' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Sửa sách
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            Cập nhật thông tin sách #{bookId}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
          borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 20,
          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
          borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 20,
          background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
        }}>
          <CheckCircle size={18} /> Cập nhật sách thành công! Đang chuyển về danh sách...
        </div>
      )}

      {/* Form */}
      <div style={{
        background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)', padding: 32,
      }}>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <Type size={16} style={{ color: '#1e293b' }} />
              Tên sách <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" name="title" value={form.title}
              onChange={handleChange} placeholder="VD: Đắc Nhân Tâm"
              style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Publisher + Author */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Building size={16} style={{ color: '#1e293b' }} />
                Nhà xuất bản <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="text" name="publisher" value={form.publisher}
                onChange={handleChange} placeholder="VD: NXB Trẻ"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <User size={16} style={{ color: '#1e293b' }} />
                Tác giả
              </label>
              <input type="text" name="author" value={form.author}
                onChange={handleChange} placeholder="VD: Dale Carnegie"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Price + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <DollarSign size={16} style={{ color: '#1e293b' }} />
                Giá (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="number" name="price" value={form.price}
                onChange={handleChange} placeholder="VD: 150000" min="0"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Package size={16} style={{ color: '#1e293b' }} />
                Tồn kho <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="number" name="stockQuantity" value={form.stockQuantity}
                onChange={handleChange} placeholder="VD: 50" min="0"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Layers size={16} style={{ color: '#1e293b' }} />
                Danh mục cha <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select value={selectedParentCat}
                onChange={(e) => { setSelectedParentCat(e.target.value); setSelectedChildCat(''); }}
                style={selectStyle} onFocus={handleFocus} onBlur={handleBlur}>
                <option value="">-- Chọn danh mục cha --</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                <Layers size={16} style={{ color: '#94a3b8' }} />
                Danh mục con
              </label>
              <select value={selectedChildCat}
                onChange={(e) => setSelectedChildCat(e.target.value)}
                style={{ ...selectStyle, opacity: childCategories.length === 0 ? 0.5 : 1 }}
                disabled={childCategories.length === 0}
                onFocus={handleFocus} onBlur={handleBlur}>
                <option value="">
                  {!selectedParentCat ? '-- Chọn danh mục cha trước --'
                    : childCategories.length === 0 ? '-- Không có danh mục con --'
                    : '-- Chọn danh mục con --'}
                </option>
                {childCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <Image size={16} style={{ color: '#1e293b' }} />
              Ảnh bìa
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="text" name="imageUrl" value={form.imageUrl}
                onChange={handleChange} placeholder="Dán URL hoặc chọn ảnh..."
                style={{ ...inputStyle, flex: 1 }}
                onFocus={handleFocus} onBlur={handleBlur} />
              <input type="file" accept="image/*" id="edit-cover-file"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const uploadedUrl = await bookImageService.uploadImage(file);
                      if (uploadedUrl) setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
                    } catch (err) { console.error("Upload error:", err); }
                  }
                }} />
              <button type="button"
                onClick={() => document.getElementById('edit-cover-file')?.click()}
                style={{
                  height: 46, padding: '0 16px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: '2px solid #e2e8f0', borderRadius: 12,
                  background: '#fff', color: '#64748b',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>
                <Upload size={14} /> Chọn ảnh
              </button>
            </div>
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="Preview"
                style={{
                  marginTop: 8, width: '100%', maxHeight: 200,
                  objectFit: 'contain', borderRadius: 12,
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                }}
                onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                onLoad={(e) => (e.target as HTMLElement).style.display = 'block'} />
            )}
          </div>

          {/* Secondary Images */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <Images size={16} style={{ color: '#1e293b' }} />
              Ảnh phụ
            </label>
            {secondaryImages.map((url, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="text" value={url}
                    onChange={(e) => {
                      const updated = [...secondaryImages];
                      updated[index] = e.target.value;
                      setSecondaryImages(updated);
                    }}
                    placeholder={`URL ảnh phụ ${index + 1}...`}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={handleFocus} onBlur={handleBlur} />
                  <button type="button"
                    onClick={() => setSecondaryImages(secondaryImages.filter((_, i) => i !== index))}
                    style={{
                      width: 42, height: 42, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #fecaca', borderRadius: 10,
                      background: '#fef2f2', cursor: 'pointer',
                    }}>
                    <X size={16} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            ))}
            <button type="button"
              onClick={() => setSecondaryImages([...secondaryImages, ''])}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '10px 16px',
                border: '2px dashed #d1d5db', borderRadius: 12,
                background: '#f8fafc', color: '#64748b',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
              }}>
              <Plus size={16} /> Thêm ảnh phụ
            </button>
          </div>

          {/* Description */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <FileText size={16} style={{ color: '#1e293b' }} />
              Mô tả
            </label>
            <textarea name="description" value={form.description}
              onChange={handleChange} placeholder="Mô tả ngắn..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
              onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px 24px',
              background: saving ? '#94a3b8' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#fff', border: 'none', borderRadius: 14,
              fontSize: 16, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.35)',
              transition: 'all 0.2s ease', marginTop: 8,
            }}>
            {saving ? (
              <><Loader2 size={20} className="animate-spin" /> Đang lưu...</>
            ) : (
              <><Save size={20} /> Lưu thay đổi</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
