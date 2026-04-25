import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  async function handleSignIn() {
    setError('');
    setBusy(true);
    try {
      const profile = await login(email, password);
      if (profile?.role !== 'teacher') {
        setError('This account is not a teacher account.');
        setBusy(false);
        return;
      }
      navigate('/teacher/dashboard');
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('No account found with that email or wrong password.');
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div
          style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          &larr; Back to home
        </div>

        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Teacher sign in</div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6,
              padding: '10px 12px', fontSize: 13, color: '#991B1B', marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <div className="stack" style={{ gap: 14 }}>
            <div>
              <label className="label">School email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="--------" value={password} onChange={e => setPassword(e.target.value)} />
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
              disabled={busy}
              onClick={handleSignIn}
            >
              {busy ? 'Signing in...' : 'Sign in'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              First time?{' '}
              <span
                style={{ color: 'var(--teal)', cursor: 'pointer' }}
                onClick={() => navigate('/teacher/signup')}
              >
                Create account
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
