import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, X, Edit2, Trash2, Upload, Image as ImageIcon, Check, FolderTree, RefreshCw } from 'lucide-react';
import api from '../api';

const resolveImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400';
  if (url.startsWith('/media/') || url.startsWith('media/')) {
    return `https://ecommerce-backened-jsiy.onrender.com/${url.replace(/^\/+/, '')}`;
  }
  return url;
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const catFileRef = useRef(null);

  // SubCategory Modal State
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [targetCatId, setTargetCatId] = useState(null);
  const [subName, setSubName] = useState('');
  const [subImage, setSubImage] = useState('');
  const [subItemCount, setSubItemCount] = useState(25);
  const subFileRef = useRef(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/categories/?_t=' + Date.now());
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Category Handlers ---
  const openAddCategory = () => {
    setEditingCat(null);
    setCatName('');
    setCatImage('');
    setShowCatModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatImage(cat.image_url || '');
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        name: catName,
        slug,
        image_url: catImage,
      };

      if (editingCat) {
        await api.patch(`/products/categories/${editingCat.id}/`, payload);
      } else {
        payload.display_order = categories.length + 1;
        await api.post('/products/categories/', payload);
      }
      setShowCatModal(false);
      fetchCategories();
    } catch (err) {
      alert('Error saving category: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? All related subcategories will also be removed.`)) return;
    try {
      await api.delete(`/products/categories/${id}/`);
      fetchCategories();
    } catch (err) {
      alert('Error deleting category: ' + (err.response?.data?.detail || err.message));
    }
  };

  // --- SubCategory Handlers ---
  const openAddSubcategory = (catId) => {
    setTargetCatId(catId);
    setEditingSub(null);
    setSubName('');
    setSubImage('');
    setSubItemCount(20);
    setShowSubModal(true);
  };

  const openEditSubcategory = (catId, sub) => {
    setTargetCatId(catId);
    setEditingSub(sub);
    setSubName(sub.name);
    setSubImage(sub.image_url || '');
    setSubItemCount(sub.item_count || 0);
    setShowSubModal(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        category: targetCatId,
        name: subName,
        slug,
        image_url: subImage,
        item_count: parseInt(subItemCount) || 0,
      };

      if (editingSub) {
        await api.patch(`/products/subcategories/${editingSub.id}/`, payload);
      } else {
        await api.post('/products/subcategories/', payload);
      }
      setShowSubModal(false);
      fetchCategories();
    } catch (err) {
      alert('Error saving subcategory: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubcategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete collection "${name}"?`)) return;
    try {
      await api.delete(`/products/subcategories/${id}/`);
      fetchCategories();
    } catch (err) {
      alert('Error deleting subcategory: ' + (err.response?.data?.detail || err.message));
    }
  };

  // --- File Reader Helpers ---
  const handleCatFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCatImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSubImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderTree color="#E11D48" size={24} />
            Categories & Collections Manager
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Manage and edit real category banners, subcategory images, and item counts in real-time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchCategories} className="btn-secondary" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openAddCategory} className="btn-primary">
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading categories...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {categories.map((cat) => (
            <div key={cat.id} style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Category Header Banner with Edit & Delete Action Buttons */}
              <div style={{
                height: '140px',
                backgroundImage: `url(${resolveImageUrl(cat.image_url)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)'
                }}></div>

                {/* Category Action Icons */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditCategory(cat)}
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer',
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Edit Category"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    style={{
                      background: 'rgba(239,68,68,0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ position: 'relative', zIndex: 1, color: '#FFFFFF' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{cat.name}</h3>
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>/{cat.slug} • {cat.subcategories?.length || 0} Collections</span>
                </div>
              </div>

              {/* Subcategories List with Images & Edit Controls */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>
                    Collections ({cat.subcategories?.length || 0})
                  </span>
                  <button
                    onClick={() => openAddSubcategory(cat.id)}
                    style={{
                      background: '#FFF1F2',
                      border: '1px solid #FFE4E6',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      color: '#E11D48',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={12} /> Add Collection
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {(!cat.subcategories || cat.subcategories.length === 0) ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94A3B8', fontSize: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
                      No collections yet. Click "+ Add Collection" above.
                    </div>
                  ) : (
                    cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px solid #F1F5F9'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={resolveImageUrl(sub.image_url)}
                            alt={sub.name}
                            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200';
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{sub.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{sub.item_count}+ Items</div>
                          </div>
                        </div>

                        {/* Subcategory edit/delete */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => openEditSubcategory(cat.id, sub)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '5px',
                              cursor: 'pointer',
                              color: '#334155'
                            }}
                            title="Edit Collection"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #FECDD3',
                              borderRadius: '6px',
                              padding: '5px',
                              cursor: 'pointer',
                              color: '#E11D48'
                            }}
                            title="Delete Collection"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal (Add / Edit) */}
      {showCatModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '480px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Footwear"
                  className="form-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="file"
                    ref={catFileRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleCatFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => catFileRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#1E293B'
                    }}
                  >
                    <Upload size={16} color="#E11D48" /> Upload from Device
                  </button>
                  {catImage && (
                    <button
                      type="button"
                      onClick={() => setCatImage('')}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    className="form-input"
                    value={catImage.startsWith('data:image') ? 'Uploaded image from device' : catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                  />
                  {catImage && (
                    <img
                      src={catImage}
                      alt="Preview"
                      style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #E11D48', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCatModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingCat ? 'Save Changes' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SubCategory Modal (Add / Edit) */}
      {showSubModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '480px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{editingSub ? 'Edit Collection' : 'Add Collection'}</h3>
              <button onClick={() => setShowSubModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveSubcategory} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handbags, Sunglasses"
                  className="form-input"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Items Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  value={subItemCount}
                  onChange={(e) => setSubItemCount(e.target.value)}
                />
              </div>

              {/* SubCategory Image Upload / URL */}
              <div className="form-group">
                <label className="form-label">Collection Image</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="file"
                    ref={subFileRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleSubFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => subFileRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#1E293B'
                    }}
                  >
                    <Upload size={16} color="#E11D48" /> Upload from Device
                  </button>
                  {subImage && (
                    <button
                      type="button"
                      onClick={() => setSubImage('')}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    className="form-input"
                    value={subImage.startsWith('data:image') ? 'Uploaded image from device' : subImage}
                    onChange={(e) => setSubImage(e.target.value)}
                  />
                  {subImage && (
                    <img
                      src={subImage}
                      alt="Preview"
                      style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #E11D48', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowSubModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingSub ? 'Save Changes' : 'Create Collection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
