import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api';

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats(true);
    const timer = setInterval(() => {
      fetchStats(false);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoading(true);
      const res = await api.get('/common/admin/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(stats?.total_sales || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: '#10B981',
      bg: '#ECFDF5',
      trend: '+18.2% this month'
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: ShoppingBag,
      color: '#E91E63',
      bg: '#FCE4EC',
      trend: '+12.5% this week'
    },
    {
      title: 'Active Customers',
      value: stats?.active_customers || 0,
      icon: Users,
      color: '#3B82F6',
      bg: '#EFF6FF',
      trend: 'Registered shoppers'
    },
    {
      title: 'Active Products',
      value: stats?.total_products || 0,
      icon: Package,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      trend: 'Across 6 categories'
    },
  ];

  return (
    <div style={{ padding: '32px' }}>
      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '18px'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={26} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{card.title}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '4px 0' }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>{card.trend}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Order Status breakdown & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Order Status Breakdown */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
            Orders Pipeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((st) => {
              const count = stats?.status_counts?.find(s => s.order_status === st)?.count || 0;
              return (
                <div key={st} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{st}</span>
                  <span className={`badge badge-${st.toLowerCase().replace(/\s+/g, '')}`}>
                    {count} orders
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="btn-secondary"
            style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
          >
            Manage All Orders <ArrowRight size={16} />
          </button>
        </div>

        {/* Recent Orders Table */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
              Recent Orders
            </h3>
            <button
              onClick={() => setActiveTab('orders')}
              style={{ background: 'none', border: 'none', color: '#E91E63', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_orders?.length > 0 ? (
                  stats.recent_orders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: '700', color: '#E91E63' }}>{ord.order_number}</td>
                      <td>{ord.customer}</td>
                      <td style={{ fontWeight: '600' }}>₹{ord.total_amount}</td>
                      <td><span style={{ fontSize: '12px', color: '#64748B' }}>{ord.payment_method}</span></td>
                      <td>
                        <span className={`badge badge-${ord.status.toLowerCase().replace(/\s+/g, '')}`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#94A3B8', padding: '30px' }}>
                      No recent orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
