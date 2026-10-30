import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, X } from 'lucide-react';
import api from '../api';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'Special Offer',
    discount_text: 'UP TO 50% OFF',
    image_url: '',
    category_slug: 'women',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/common/banners/');
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotional banner?')) return;
    try {
      await api.delete(`/common/banners/${id}/`);
      setBanners(banners.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/common/banners/', formData);
      setShowAdd(false);
      setFormData({
        title: '',
        subtitle: '',
        badge: 'Special Offer',
        discount_text: 'UP TO 50% OFF',
        image_url: '',
        category_slug: 'women',
      });
      fetchBanners();
    } catch (err) {
      alert('Error creating banner');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Home Carousel Banners</h2>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Promotions featured in the mobile app customer home screen</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={18} /> Add Banner
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {banners.map((b) => (
          <div key={b.id} style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              height: '180px',
              backgroundImage: `url(${b.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  background: '#E91E63',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {b.badge}
                </span>
              </div>

              <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{b.title}</h3>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#FDE047', marginTop: '2px' }}>
                  {b.discount_text}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Category Target: <strong style={{ color: '#0F172A' }}>{b.category_slug}</strong>
              </div>
              <button onClick={() => handleDelete(b.id)} className="btn-danger" style={{ padding: '6px 10px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Add Hero Banner</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trendy Summer Styles"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Badge Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Highlight</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.discount_text}
                    onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
