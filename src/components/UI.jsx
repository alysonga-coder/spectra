// ============================================================
//  components/UI.jsx
//  Reusable UI primitives used across teacher + student views.
// ============================================================

import React from 'react';

// ---- Avatar ------------------------------------------------
export function Avatar({ initials, bg, color, size = 36 }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: bg, color, fontSize: size * 0.33 }}
    >
      {initials}
    </div>
  );
}

// ---- Badge -------------------------------------------------
export function Badge({ children, variant = 'gray' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ---- Status dot --------------------------------------------
export function StatusDot({ status }) {
  const cls = {
    calm:    'dot dot-calm',
    alert:   'dot dot-alert',
    stress:  'dot dot-stress',
    offline: 'dot dot-offline',
  }[status] || 'dot dot-offline';
  return <span className={cls} />;
}

// ---- Progress bar ------------------------------------------
export function ProgressBar({ pct, variant = 'teal', height = 6 }) {
  return (
    <div className="pbar" style={{ height }}>
      <div
        className={`pbar-fill pbar-${variant}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ---- Alert strip -------------------------------------------
export function Alert({ children, variant = 'info' }) {
  return <div className={`alert alert-${variant}`}>{children}</div>;
}

// ---- Stat card ---------------------------------------------
export function StatCard({ label, value, sub, valueColor }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ---- Signal row --------------------------------------------
export function SigRow({ label, value, valueColor }) {
  return (
    <div className="sig-row">
      <span className="sig-label">{label}</span>
      <span className="sig-value" style={valueColor ? { color: valueColor } : {}}>{value}</span>
    </div>
  );
}

// ---- Timeline item -----------------------------------------
export function TlItem({ text, time, color = 'var(--teal)' }) {
  return (
    <div className="tl-item">
      <div className="tl-dot" style={{ background: color }} />
      <div>
        <div className="tl-text">{text}</div>
        {time && <div className="tl-time">{time}</div>}
      </div>
    </div>
  );
}

// ---- Section divider ---------------------------------------
export function Divider() {
  return <div className="divider" />;
}

// ---- Tag selector ------------------------------------------
export function Tag({ label, selected, onToggle }) {
  return (
    <div
      className={`tag${selected ? ' selected' : ''}`}
      onClick={() => onToggle(label)}
    >
      {label}
    </div>
  );
}

export function TagRow({ options, selected, onToggle }) {
  return (
    <div className="tag-row">
      {options.map(opt => (
        <Tag key={opt} label={opt} selected={selected.includes(opt)} onToggle={onToggle} />
      ))}
    </div>
  );
}

// ---- Frustration bar (with threshold marker) ---------------
export function FrustrationBar({ score }) {
  const variant = score >= 70 ? 'coral' : score >= 35 ? 'amber' : 'teal';
  const label   = score >= 70 ? 'High' : score >= 35 ? 'Moderate' : 'Low';
  const labelColor = score >= 70 ? 'var(--coral-dark)' : score >= 35 ? 'var(--amber-dark)' : 'var(--teal-dark)';
  return (
    <div>
      <div className="row-between" style={{ fontSize: 11, marginBottom: 4 }}>
        <span className="text-muted">Frustration score</span>
        <span style={{ fontWeight: 500, color: labelColor }}>{label} ({score}%)</span>
      </div>
      <div className="pbar" style={{ position: 'relative', height: 8 }}>
        <div className={`pbar-fill pbar-${variant}`} style={{ width: `${score}%` }} />
        {/* threshold marker at 70% */}
        <div style={{
          position: 'absolute', top: 0, left: '70%',
          width: 2, height: '100%', background: 'var(--coral)',
          opacity: 0.5,
        }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textAlign: 'right' }}>
        Reframe threshold: 70
      </div>
    </div>
  );
}
