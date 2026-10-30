import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit, Check, AlertCircle, X, Star, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import api from '../api';

const resolveImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200';
  if (url.startsWith('/media/') || url.startsWith('media/')) {
    return `https://ecommerce-backened-jsiy.onrender.com/${url.replace(/^\/+/, '')}`;
  }
  return url;
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState('');

  // Clean Form State with no hardcoded dummy data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    price: '',
    original_price: '',
    description: '',
    rating: 4.5,
    is_trending: false,
    is_new_arrival: false,
    image_url: '',
  });

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      slug: p.slug || '',
      category: p.category || (categories[0]?.id || 1),
      price: p.price || '',
      original_price: p.original_price || '',
      description: p.description || '',
      rating: p.rating || 4.5,
      is_trending: !!p.is_trending,
      is_new_arrival: !!p.is_new_arrival,
      image_url: p.primary_image || '',
    });
    setImagePreview(resolveImageUrl(p.primary_image));
    setShowAddModal(true);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Auto-refresh polling every 10 seconds
    const interval = setInterval(() => {
      fetchProducts(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedCategory]);

  const fetchProducts = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const url = selectedCategory ? `/products/items/?category=${selectedCategory}` : '/products/items/';
      const res = await api.get(url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now());
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data?.results && Array.isArray(res.data.results)) {
        setProducts(res.data.results);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/');
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setFormData(prev => ({ ...prev, image_url: base64Data }));
        setImagePreview(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/items/${id}/`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        name: formData.name,
        slug: slug,
        category: formData.category ? parseInt(formData.category) : (categories[0]?.id || 1),
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : parseFloat(formData.price),
        description: formData.description,
        rating: parseFloat(formData.rating) || 4.5,
        is_trending: formData.is_trending,
        is_new_arrival: formData.is_new_arrival,
        image_url: formData.image_url || '',
      };

      if (editingProduct) {
        await api.patch(`/products/items/${editingProduct.id}/`, payload);
      } else {
        await api.post('/products/items/', payload);
      }

      setShowAddModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        category: '',
        price: '',
        original_price: '',
        description: '',
        rating: 4.5,
        is_trending: false,
        is_new_arrival: false,
        image_url: '',
      });
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchProducts();
    } catch (err) {
      alert('Error saving product: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '32px' }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search products by title, category..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '180px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => fetchProducts()}
            className="btn-secondary"
            title="Refresh Products"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              slug: '',
              category: categories[0]?.id || '',
              price: '',
              original_price: '',
              description: '',
              rating: 4.5,
              is_trending: false,
              is_new_arrival: false,
              image_url: '',
            });
            setImagePreview('');
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Image & Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Original Price</th>
              <th>Discount</th>
              <th>Rating</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  Loading product catalog...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={resolveImageUrl(p.primary_image)}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200';
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>ID: #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background: '#F1F5F9',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#475569'
                    }}>
                      {p.category_name || categories.find(c => c.id === p.category)?.name || 'Fashion'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>₹{p.price}</td>
                  <td style={{ color: '#94A3B8', textDecoration: 'line-through' }}>
                    {p.original_price ? `₹${p.original_price}` : '-'}
                  </td>
                  <td>
                    {p.discount_percent > 0 ? (
                      <span style={{ color: '#E91E63', fontWeight: '700', fontSize: '13px' }}>
                        {p.discount_percent}% OFF
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}>
                      <Star size={14} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                      <span>{p.rating}</span>
                      <span style={{ color: '#94A3B8', fontSize: '11px' }}>({p.review_count || 100})</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {p.is_trending && (
                        <span style={{ background: '#FCE4EC', color: '#E91E63', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          Trending
                        </span>
                      )}
                      {p.is_new_arrival && (
                        <span style={{ background: '#E0F2FE', color: '#0284C7', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="btn-secondary"
                        title="Edit Product"
                        style={{ padding: '6px 10px', color: '#0284C7', borderColor: '#BAE6FD', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit size={14} />
                        <span style={{ fontSize: '12px' }}>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-danger"
                        title="Delete Product"
                        style={{ padding: '6px 8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal with Real Device Upload & Live Preview */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                {editingProduct ? 'Edit Fashion Product' : 'Add New Fashion Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elegant Silk Maxi Dress"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Dynamic Image Upload from Device or URL */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Product Image</label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image_url: '' }));
                        setImagePreview('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
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
                    <Upload size={16} color="#E11D48" />
                    Upload from Device / Gallery
                  </button>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>or enter image link below</span>
                </div>

                {/* URL Input & Live Preview */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="https://example.com/product-image.jpg"
                    className="form-input"
                    value={formData.image_url.startsWith('data:image') ? 'Uploaded image from device' : formData.image_url}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, image_url: val });
                      setImagePreview(val);
                    }}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #E11D48', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="2499"
                    className="form-input"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    className="form-input"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Write a compelling fashion description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                  />
                  Mark as Trending
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                  />
                  Mark as New Arrival
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
