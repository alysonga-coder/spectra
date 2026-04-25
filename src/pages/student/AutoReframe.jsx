import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent } from '../../lib/mockData';
import { Alert } from '../../components/UI';

const STUDENT = getStudent('jamie');

export default function AutoReframe() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleAnswer = (idx) => {
    setSelected(idx);
    if (idx === 0) {
      // correct (5)
      setTimeout(() => navigate('/student/complete'), 1200);
    }
  };

  return (
    <div className="stack" style={{ gap: 14 }}>

      {/* Warm reframe bridge */}
      <div style={{
        background: 'var(--purple-light)', border: '0.5px solid var(--purple)',
        borderRadius: 'var(--radius)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>⭐</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--purple-dark)' }}>
            Let's try it a different way!
          </div>
          <div style={{ fontSize: 12, color: 'var(--purple-dark)', opacity: 0.8, marginTop: 2 }}>
            {STUDENT.characters[0]} has a trick to make this easier.
          </div>
        </div>
      </div>

      {/* Simplified / stepped version of the question */}
      <div className="card">
        <div className="char-bubble">{STUDENT.characters[0]} is here to help! 💙</div>

        {/* Visual scaffold */}
        <div style={{
          background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
          padding: 12, fontSize: 12, color: 'var(--teal-dark)', marginBottom: 14,
        }}>
          📷 Cloudinary — step-by-step visual with pizza slices (simpler version)
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>
            Step 1 — look at the bottom numbers
          </div>
          <div style={{ fontSize: 15, background: 'var(--bg)', borderRadius: 6, padding: '8px 12px' }}>
            ³⁄₈ + ²⁄₈ — are the bottom numbers the same? <strong>Yes!</strong>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>
            Step 2 — just add the top numbers
          </div>
          <div style={{
            background: 'var(--purple-light)', borderRadius: 8, padding: 14,
            textAlign: 'center', fontSize: 22, fontWeight: 500, color: 'var(--purple-dark)',
          }}>
            3 + 2 = ?
          </div>
        </div>

        {/* Simplified answer options */}
        {[['5 → so the answer is ⁵⁄₈', true], ['6 → so the answer is ⁶⁄₈', false], ['4 → so the answer is ⁴⁄₈', false]].map(([opt, correct], idx) => (
          <div
            key={idx}
            className={`ans-opt${selected === idx ? (correct ? ' correct' : ' wrong') : ''}`}
            onClick={() => selected === null && handleAnswer(idx)}
            style={{ cursor: selected !== null ? 'default' : 'pointer' }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{String.fromCharCode(65 + idx)}.</span>
            <span style={{ fontSize: 14 }}>{opt}</span>
          </div>
        ))}

        {selected === 0 && (
          <div style={{
            marginTop: 10, padding: 10, borderRadius: 6,
            background: 'var(--teal-light)', color: 'var(--teal-dark)', fontSize: 13,
          }}>
            You got it! Way to go! 🌟
          </div>
        )}
      </div>

      {/* Teacher notification */}
      <Alert variant="info">
        Ms. Rivera has been quietly notified and may check in soon. Keep going — you're doing great!
      </Alert>

      {/* ElevenLabs audio note */}
      <div style={{
        background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
        padding: 10, fontSize: 12, color: 'var(--blue-dark)',
      }}>
        🔊 ElevenLabs — reading the steps aloud now to support auditory processing
      </div>

    </div>
  );
}
