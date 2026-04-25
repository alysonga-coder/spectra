import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function StudentLayout() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Minimal top bar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52, background: 'var(--surface)',
        borderBottom: '0.5px solid var(--border)', flexShrink: 0,
      }}>
        <div
          style={{ fontSize: 15, fontWeight: 500, color: 'var(--purple)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
          onClick={() => navigate('/student/home')}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--purple)' }} />
          Spectra
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/')}
        >
          Exit
        </button>
      </nav>

      {/* Page content — centered, constrained width for phone-like layout */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
}
