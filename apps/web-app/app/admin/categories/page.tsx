'use client';

import { useState, useEffect, useMemo } from 'react';
import { categoryService } from '@/src/api/categoryService';
import type { Category } from '@/src/types';
import {
  Plus, Edit2, Trash2, AlertCircle, CheckCircle,
  FolderTree, ChevronRight, Tag
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', parentId: '' });

  // Delete state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const parentCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);

  // Handle Create / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        parentId: formData.parentId ? Number(formData.parentId) : null
      };

      if (editingId) {
        await categoryService.updateCategory(editingId, payload);
        setMessage({ type: 'success', text: 'Cập nhật danh mục thành công!' });
      } else {
        await categoryService.createCategory(payload);
        setMessage({ type: 'success', text: 'Thêm danh mục thành công!' });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Có lỗi xảy ra!' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await categoryService.deleteCategory(deleteId);
      setMessage({ type: 'success', text: 'Đã xóa danh mục!' });
      fetchCategories();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể xóa danh mục này. Có thể danh mục đang chứa sách hoặc danh mục con.' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, parentId: category.parentId ? String(category.parentId) : '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', parentId: '' });
    }
    setIsModalOpen(true);
  };

  if (loading && categories.length === 0) {
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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Quản lý Danh mục</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>Phân loại và cấu trúc sách trong hệ thống</p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 12,
            background: '#0f172a', color: '#fff',
            fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(15,23,42,0.2)',
          }}
        >
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', borderRadius: 12, marginBottom: 20, fontSize: 14, fontWeight: 500,
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Categories List */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', padding: 20
      }}>
        {parentCategories.map(parent => {
          const children = categories.filter(c => c.parentId === parent.id);
          return (
            <div key={parent.id} style={{ marginBottom: 20 }}>
              {/* Parent Category */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: '#f8fafc', borderRadius: 8,
                borderLeft: '4px solid #3b82f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FolderTree size={20} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{parent.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openModal(parent)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3b82f6' }}><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteId(parent.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Children Categories */}
              {children.length > 0 && (
                <div style={{ paddingLeft: 32, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {children.map(child => (
                    <div key={child.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 16px', background: '#fff', borderRadius: 8, border: '1px solid #f1f5f9'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
                        <Tag size={16} style={{ color: '#64748b' }} />
                        <span style={{ fontSize: 14, color: '#334155' }}>{child.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openModal(child)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteId(child.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {parentCategories.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            Chưa có danh mục nào.
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 400, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 20px' }}>
              {editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 14, outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Danh mục cha (Tùy chọn)</label>
                <select
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', background: '#fff'
                  }}
                >
                  <option value="">-- Không có (Danh mục gốc) --</option>
                  {parentCategories.filter(c => c.id !== editingId).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600
                }}>Hủy</button>
                <button type="submit" style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer', fontWeight: 600
                }}>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {deleteId !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 360, padding: 24, textAlign: 'center' }}>
            <Trash2 size={48} style={{ color: '#ef4444', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Xác nhận xóa?</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
              Hành động này không thể hoàn tác. Nếu danh mục đang chứa sách hoặc danh mục con, hệ thống sẽ chặn lệnh xóa.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button disabled={deleting} onClick={() => setDeleteId(null)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600
              }}>Hủy</button>
              <button disabled={deleting} onClick={handleDelete} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 600
              }}>
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
