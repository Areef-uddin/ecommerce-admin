import React from 'react';
import { Bell, Search, ExternalLink } from 'lucide-react';

export default function Header({ title, subtitle }) {
  return (
    <header style={{
      height: '70px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.3px' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a
          href="https://ecommerce-backened-jsiy.onrender.com/admin/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#64748B',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            fontWeight: '600'
          }}
        >
          <ExternalLink size={14} />
          Django Admin
        </a>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#F1F5F9',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#0F172A'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
          Render API: Online
        </div>
      </div>
    </header>
  );
}
