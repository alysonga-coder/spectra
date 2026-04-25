import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDENTS } from '../../lib/mockData';
import { Avatar } from '../../components/UI';

export default function StudentLogin() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--purple)', marginBottom: 6 }}>
            Who are you?
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Pick your name below</div>
        </div>

        <div className="stack" style={{ gap: 10 }}>
          {STUDENTS.map(s => (
            <div
              key={s.id}
              className="card"
              style={{
                cursor: 'pointer', transition: 'all 0.15s',
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
              }}
              onClick={() => navigate('/student/home')}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--purple)';
                e.currentTarget.style.background  = 'var(--purple-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.background  = '';
              }}
            >
              <div className="row" style={{ gap: 14 }}>
                <Avatar
                  initials={s.initials}
                  bg={s.avatarColor.bg}
                  color={s.avatarColor.text}
                  size={44}
                />
                <div style={{ fontSize: 16, fontWeight: 500 }}>{s.name}</div>
                <div style={{ marginLeft: 'auto', fontSize: 20 }}>→</div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-purple btn-full btn-lg"
          style={{ marginTop: 20, fontSize: 16 }}
          onClick={() => navigate('/student/home')}
        >
          That's me!
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Your teacher set up your account. No password needed!
        </div>

      </div>
    </div>
  );
}
