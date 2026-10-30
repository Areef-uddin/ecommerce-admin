import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, RefreshCw } from 'lucide-react';
import api from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers(true);
    const timer = setInterval(() => {
      fetchCustomers(false);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchCustomers = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoading(true);
      const res = await api.get('/auth/admin/customers/');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Registered Customers</h2>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Real shoppers registered through the StyleHub mobile app</p>
        </div>
        <button onClick={fetchCustomers} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={15} /> Refresh List
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Member Since</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  Loading registered customer profiles...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No customer accounts registered yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={c.avatar}
                        alt={c.full_name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ fontWeight: '700', color: '#0F172A' }}>{c.full_name}</div>
                    </div>
                  </td>
                  <td style={{ color: '#475569' }}>{c.email}</td>
                  <td style={{ color: '#475569' }}>{c.phone}</td>
                  <td><strong style={{ color: '#E91E63' }}>{c.orders_count}</strong></td>
                  <td style={{ fontSize: '13px', color: '#64748B' }}>{c.joined}</td>
                  <td>
                    <span style={{
                      background: c.status === 'Active' ? '#ECFDF5' : '#FEE2E2',
                      color: c.status === 'Active' ? '#059669' : '#DC2626',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      ● {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
