import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('mrivera@sunviewschool.edu');
  const [password, setPassword] = useState('');
  const [code, setCode]       = useState('SV-4B');

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Back link */}
        <div
          style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          ← Back to home
        </div>

        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Teacher sign in</div>

          <div className="stack" style={{ gap: 14 }}>
            <div>
              <label className="label">School email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Class code</label>
              <input className="input" type="text" value={code} onChange={e => setCode(e.target.value)} />
            </div>

            <div className="row-between" style={{ fontSize: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <span style={{ color: 'var(--teal)', cursor: 'pointer' }}>Forgot password?</span>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 4 }}
              onClick={() => navigate('/teacher/dashboard')}
            >
              Sign in
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              First time?{' '}
              <span style={{ color: 'var(--teal)', cursor: 'pointer' }}>Create account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
