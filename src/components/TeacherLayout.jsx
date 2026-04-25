import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TEACHER } from '../lib/mockData';

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/teacher/dashboard' },
  { label: 'Assignments', path: '/teacher/upload' },
  { label: 'Live monitor',path: '/teacher/monitor' },
  { label: 'Reports',     path: '/teacher/reports' },
  { label: 'Settings',    path: '/teacher/settings' },
];

export default function TeacherLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Top nav */}
      <nav className="topnav">
        <div className="topnav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="topnav-logo-ring" />
          Spectra
        </div>
        <div className="topnav-tabs">
          {NAV_ITEMS.map(item => (
            <div
              key={item.path}
              className={`topnav-tab${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="topnav-right">
          <span className="badge badge-teal">{TEACHER.name} · {TEACHER.room}</span>
          <div
            className="avatar"
            style={{ width: 32, height: 32, background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 12, cursor: 'pointer' }}
          >
            MR
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

    </div>
  );
}
