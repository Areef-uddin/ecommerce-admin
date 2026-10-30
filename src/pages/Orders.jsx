import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Eye, Truck, CheckCircle2, Clock, X, Phone, MapPin, User,
  ArrowRight, RefreshCw, Copy, Check, Play, RotateCcw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import api from '../api';
const TRACKING_STAGES = [
  'Order Placed',
  'Confirmed',
  'Packed',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered'
];
const normalizedTrackingStatus = (status) => status === 'Placed' ? 'Order Placed' : status;
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [updatingReturnId, setUpdatingReturnId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  useEffect(() => {
    fetchOrders(true);
    fetchReturns();
    const timer = setInterval(() => {
      fetchOrders(false);
      fetchReturns();
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedStatus]);
  const fetchOrders = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoading(true);
      const url = selectedStatus === 'all' ? '/orders/orders/' : `/orders/orders/?status=${encodeURIComponent(selectedStatus)}`;
      const res = await api.get(url);
      setOrders(res.data);
      // Sync currently open order if any
      if (viewingOrder) {
        const updated = res.data.find(o => o.id === viewingOrder.id);
        if (updated) setViewingOrder(updated);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };
  const fetchReturns = async () => {
    try {
      const res = await api.get('/orders/returns/');
      setReturnRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching return requests:', err);
    }
  };
  const handleReturnStatus = async (returnRequest, nextStatus) => {
    const isCod = ['Cash on Delivery', 'COD'].includes(returnRequest.payment_method);
    const confirmManualRefund = isCod && nextStatus === 'Refund Processed'
      ? window.confirm('Confirm that the COD refund was transferred to the customer manually?')
      : true;
    if (!confirmManualRefund) return;
    if (nextStatus === 'Refund Processed' && !isCod && !window.confirm(`Send ₹${returnRequest.refund_amount} back through Razorpay?`)) return;
    try {
      setUpdatingReturnId(returnRequest.id);
      await api.post(`/orders/returns/${returnRequest.id}/update_status/`, {
        status: nextStatus,
        ...(isCod && nextStatus === 'Refund Processed' ? { manual_refund_confirmed: true } : {}),
      });
      await fetchReturns();
      await fetchOrders(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not update return request');
    } finally {
      setUpdatingReturnId(null);
    }
  };
  const handleSimulateStatus = async (orderId, newStatus, locationOverride = null, noteOverride = null) => {
    try {
      setUpdatingStatus(true);
      const payload = {
        status: newStatus,
        location: locationOverride !== null ? locationOverride : customLocation,
        note: noteOverride !== null ? noteOverride : customNote,
      };
      const res = await api.post(`/orders/orders/${orderId}/simulate_tracking/`, payload);
      const updatedOrder = res.data.order;
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder(updatedOrder);
      }
      setCustomLocation('');
      setCustomNote('');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update tracking');
    } finally {
      setUpdatingStatus(false);
    }
  };
  const handleAdvanceNextStage = async (order) => {
    const currIdx = TRACKING_STAGES.indexOf(normalizedTrackingStatus(order.order_status));
    if (currIdx >= 0 && currIdx < TRACKING_STAGES.length - 1) {
      const nextStatus = TRACKING_STAGES[currIdx + 1];
      await handleSimulateStatus(order.id, nextStatus);
    }
  };
  const handleResetSimulation = async (orderId) => {
    try {
      setUpdatingStatus(true);
      const res = await api.post(`/orders/orders/${orderId}/reset_demo_tracking/`);
      const updatedOrder = res.data.order;
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder(updatedOrder);
      }
    } catch (err) {
      alert('Failed to reset simulation');
    } finally {
      setUpdatingStatus(false);
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };
  const filterTabs = [
    'all',
    'Order Placed',
    'Confirmed',
    'Packed',
    'Picked Up',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];
  return (
    <div style={{ padding: '32px' }}>
      {/* Header with Title and Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Orders & Tracking</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage customer orders and simulate live dummy courier delivery lifecycle
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '13px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Orders
        </button>
      </div>
      <section style={{ marginBottom: '24px', padding: '18px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px' }}>Returns & Refunds</h3>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '12px' }}>Review customer requests, schedule pickup, and issue eligible refunds.</p>
          </div>
          <button className="btn-secondary" onClick={fetchReturns} style={{ padding: '7px 12px', fontSize: '12px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        {returnRequests.length === 0 ? (
          <div style={{ padding: '14px', color: '#64748B', fontSize: '13px' }}>No return requests yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Return / Order</th><th>Customer & Item</th><th>Reason</th><th>Refund</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{returnRequests.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}<br /><small>{r.order_number}</small></td>
                  <td>{r.customer_name}<br /><small>{r.product_name}</small></td>
                  <td>{r.reason}<br /><small>{r.pickup_type}</small></td>
                  <td>₹{Number(r.refund_amount || 0).toFixed(2)}<br /><small>{r.payment_method}</small></td>
                  <td>{r.status}</td>
                  <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {!['Refund Processed', 'Rejected'].includes(r.status) && <>
                      {r.status === 'Initiated' && !String(r.pickup_type).toLowerCase().startsWith('drop') && <button disabled={updatingReturnId === r.id} onClick={() => handleReturnStatus(r, 'Pickup Scheduled')} className="btn-secondary">Schedule pickup</button>}
                      {(r.status === 'Pickup Scheduled' || (r.status === 'Initiated' && String(r.pickup_type).toLowerCase().startsWith('drop'))) && <button disabled={updatingReturnId === r.id} onClick={() => handleReturnStatus(r, 'Pickup Received')} className="btn-secondary">Confirm item received</button>}
                      {r.status === 'Pickup Received' && <button disabled={updatingReturnId === r.id} onClick={() => handleReturnStatus(r, 'Refund Processed')} className="btn-primary">{updatingReturnId === r.id ? 'Processing…' : (['Cash on Delivery', 'COD'].includes(r.payment_method) ? 'Confirm manual refund' : 'Process refund')}</button>}
                      <button disabled={updatingReturnId === r.id} onClick={() => handleReturnStatus(r, 'Rejected')} className="btn-secondary">Reject</button>
                    </>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {filterTabs.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: selectedStatus === st ? '#E91E63' : '#FFFFFF',
              color: selectedStatus === st ? '#FFFFFF' : '#475569',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              textTransform: 'capitalize'
            }}
          >
            {st}
          </button>
        ))}
      </div>
      {/* Orders Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order / Tracking ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No orders found for this status.
                </td>
              </tr>
            ) : (
              orders.map((ord) => {
                const trackingNumber = ord.tracking_number || (ord.shipment && ord.shipment.tracking_number) || `TEST-FASH-${1000 + ord.id}`;
                return (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: '800', color: '#E91E63' }}>{ord.order_number}</div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#0284C7',
                        background: '#E0F2FE',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '4px'
                      }}>
                        <Truck size={11} /> {trackingNumber}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748B' }}>
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{ord.customer_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{ord.phone}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#334155' }}>
                        {ord.items?.length || 0} items
                      </span>
                    </td>
                    <td style={{ fontWeight: '800', color: '#0F172A' }}>₹{ord.total_amount}</td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{ord.payment_method}</div>
                      <span style={{ fontSize: '11px', color: ord.payment_status === 'Paid' ? '#10B981' : '#F59E0B' }}>
                        ● {ord.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${(ord.order_status || '').toLowerCase().replace(/\s+/g, '')}`}>
                        {ord.order_status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setViewingOrder(ord)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={14} /> View & Simulate
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Order Details & DEMO TRACKING Modal */}
      {viewingOrder && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: '#FFFFFF',
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                    Order Details: <span style={{ color: '#E91E63' }}>{viewingOrder.order_number}</span>
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    background: '#FEF3C7',
                    color: '#D97706',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Truck size={12} /> DEMO COURIER ACTIVE
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Placed on {new Date(viewingOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              {/* DEMO COURIER TRACKING SIMULATOR PANEL */}
              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%)',
                padding: '20px',
                borderRadius: '16px',
                border: '2px solid #E2E8F0',
                marginBottom: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={18} color="#E91E63" /> Courier Tracking Simulator
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Change tracking stages manually. No paid courier API or live GPS required.
                    </p>
                  </div>
                  <button
                    onClick={() => handleResetSimulation(viewingOrder.id)}
                    disabled={updatingStatus}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RotateCcw size={13} /> Reset to Placed
                  </button>
                </div>
                {/* Tracking ID and Courier Badge */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  background: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: '600' }}>TRACKING NUMBER</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <strong style={{ fontSize: '14px', color: '#0284C7', fontFamily: 'monospace' }}>
                        {viewingOrder.tracking_number || viewingOrder.shipment?.tracking_number || `TEST-FASH-${1000 + viewingOrder.id}`}
                      </strong>
                      <button
                        onClick={() => copyToClipboard(viewingOrder.tracking_number || `TEST-FASH-${1000 + viewingOrder.id}`)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
                        title="Copy Tracking ID"
                      >
                        {copiedId ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: '600' }}>LOGISTICS PARTNER</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      {viewingOrder.shipment?.courier_name || 'StyleHub Express (Demo)'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: '600' }}>CURRENT STATUS</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '800',
                      color: viewingOrder.order_status === 'Delivered' ? '#10B981' : '#E91E63'
                    }}>
                      ● {viewingOrder.order_status}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: '600' }}>ESTIMATED DELIVERY</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      {viewingOrder.estimated_delivery || '31 Oct - 03 Nov'}
                    </span>
                  </div>
                </div>
                {/* 7 Tracking Stages Stepper Buttons */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>
                    Select Tracking Stage (1-Click Progression):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '6px' }}>
                    {TRACKING_STAGES.map((step, idx) => {
                      const currentStatus = normalizedTrackingStatus(viewingOrder.order_status);
                      const currIdx = TRACKING_STAGES.indexOf(currentStatus);
                      const isCurrent = currentStatus === step;
                      const isPassed = currIdx > idx;
                      let bg = '#FFFFFF';
                      let color = '#334155';
                      let borderColor = '#CBD5E1';
                      if (isCurrent) {
                        bg = '#E91E63';
                        color = '#FFFFFF';
                        borderColor = '#E91E63';
                      } else if (isPassed) {
                        bg = '#F0FDF4';
                        color = '#15803D';
                        borderColor = '#86EFAC';
                      }
                      return (
                        <button
                          key={step}
                          disabled={updatingStatus}
                          onClick={() => handleSimulateStatus(viewingOrder.id, step)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            background: bg,
                            color: color,
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontSize: '9px', opacity: 0.8 }}>STEP {idx + 1}</div>
                          <div style={{ marginTop: '2px', lineHeight: 1.2 }}>{step}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Optional Custom Location & Milestone Note */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Milestone Location (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Regional Sorting Facility, Mumbai"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Activity Description Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Package cleared hub inspection"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                {/* Advance Step Action Button */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleAdvanceNextStage(viewingOrder)}
                    disabled={updatingStatus || viewingOrder.order_status === 'Delivered'}
                    style={{
                      background: viewingOrder.order_status === 'Delivered' ? '#94A3B8' : '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: viewingOrder.order_status === 'Delivered' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Play size={13} /> Advance to Next Stage
                  </button>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Note: An order will NEVER be marked Delivered unless explicitly chosen in the demo.
                  </span>
                </div>
                {/* Milestone Audit Timeline inside modal */}
                {viewingOrder.shipment && viewingOrder.shipment.milestones && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #CBD5E1' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '10px' }}>
                      Live Milestone Timeline & Timestamp Audit:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {viewingOrder.shipment.milestones.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: m.is_completed ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                            borderRadius: '8px',
                            border: `1px solid ${m.is_completed ? '#86EFAC' : '#E2E8F0'}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: m.is_completed ? '#10B981' : '#E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF'
                            }}>
                              {m.is_completed ? <Check size={12} /> : <span style={{ fontSize: '10px', color: '#94A3B8' }}>{m.order_index + 1}</span>}
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: m.is_completed ? '#0F172A' : '#94A3B8' }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                {m.location} {m.description && `• ${m.description}`}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: m.is_completed ? '#10B981' : '#94A3B8' }}>
                            {m.is_completed ? (m.date_formatted || 'Completed') : 'Pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Customer & Address Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#475569', fontWeight: '700', fontSize: '13px' }}>
                    <User size={16} /> Customer Details
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{viewingOrder.customer_name}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Phone size={14} /> {viewingOrder.phone}
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#475569', fontWeight: '700', fontSize: '13px' }}>
                    <MapPin size={16} /> Delivery Address ({viewingOrder.address_type})
                  </div>
                  <div style={{ fontSize: '13px', color: '#1E293B', lineHeight: '1.4' }}>
                    {viewingOrder.delivery_address}
                  </div>
                </div>
              </div>
              {/* Items List */}
              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', color: '#0F172A' }}>
                Ordered Items ({viewingOrder.items?.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {viewingOrder.items?.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200'}
                        alt={item.product_name}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.product_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>
                      ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>
              {/* Price Breakdown */}
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Item Total</span>
                  <span>₹{viewingOrder.item_total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#10B981' }}>
                  <span>Discount</span>
                  <span>-₹{viewingOrder.discount_amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Delivery Fee</span>
                  <span>{viewingOrder.delivery_charges > 0 ? `₹${viewingOrder.delivery_charges}` : 'FREE'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid #E2E8F0',
                  fontWeight: '800',
                  fontSize: '16px'
                }}>
                  <span>Final Total</span>
                  <span style={{ color: '#E91E63' }}>₹{viewingOrder.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
