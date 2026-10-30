import React, { useState } from 'react';
import { Lock, Mail, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@stylehub.com');
  const [password, setPassword] = useState('adminpassword');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/admin-login/', { email, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem('stylehub_admin_token', access);
      localStorage.setItem('stylehub_admin_refresh', refresh);
      localStorage.setItem('stylehub_admin_user', JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid admin credentials or server offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 16px',
            boxShadow: '0 10px 20px rgba(233, 30, 99, 0.3)'
          }}>
            <ShoppingBag size={32} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            StyleHub Admin
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
            Enter your credentials to access the management portal
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#94A3B8' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '42px' }}
                placeholder="admin@stylehub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#94A3B8' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '42px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          padding: '14px',
          background: '#F8FAFC',
          borderRadius: '10px',
          border: '1px dashed #CBD5E1',
          fontSize: '12px',
          color: '#64748B',
          textAlign: 'center'
        }}>
          <strong>Default Admin Credentials:</strong><br />
          Email: <span style={{ color: '#0F172A', fontWeight: '600' }}>admin@stylehub.com</span> | Password: <span style={{ color: '#0F172A', fontWeight: '600' }}>adminpassword</span>
        </div>
      </div>
    </div>
  );
}
