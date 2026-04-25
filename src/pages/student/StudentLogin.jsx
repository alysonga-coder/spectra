import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function StudentLogin() {
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
      if (profile?.role !== 'student') {
        await signOut(auth);
        setError('This account is not a student account.');
        setBusy(false);
        return;
      }
      navigate('/student/home');
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

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--purple)', marginBottom: 6 }}>
            Welcome back!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sign in to continue learning</div>
        </div>

        <div className="card">
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
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="--------" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button
              className="btn btn-purple btn-full btn-lg"
              style={{ marginTop: 4 }}
              disabled={busy}
              onClick={handleSignIn}
            >
              {busy ? 'Signing in...' : 'Sign in'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <span
                style={{ color: 'var(--purple)', cursor: 'pointer' }}
                onClick={() => navigate('/student/signup')}
              >
                Create account
              </span>
            </div>

            <div
              style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              &larr; Back to home
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
