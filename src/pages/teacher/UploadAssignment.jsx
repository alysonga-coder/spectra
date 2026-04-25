import React, { useState } from 'react';
import { STUDENTS, ASSIGNMENTS } from '../../lib/mockData';
import { Alert } from '../../components/UI';

const SUBJECTS = ['Math', 'Reading', 'Science', 'Social Skills', 'Writing'];

export default function UploadAssignment() {
  const [subject, setSubject]     = useState('Math');
  const [content, setContent]     = useState(ASSIGNMENTS[0].rawContent);
  const [dueDate, setDueDate]     = useState('Apr 26, 2026');
  const [assignTo, setAssignTo]   = useState('all');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // TODO: call Gemma API here to generate adapted versions per student profile
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <div className="page-title">New lesson</div>
          <div className="page-sub">Gemma will adapt this for each student's learning profile automatically</div>
        </div>
      </div>

      {submitted && (
        <Alert variant="info">
          Adapted versions generated for {STUDENTS.length} students. Cloudinary images queued. ElevenLabs narration ready.{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Preview all →</span>
        </Alert>
      )}

      <div className="grid-2" style={{ gap: 16 }}>

        {/* Input form */}
        <div className="card">
          <div className="card-title">Lesson content</div>
          <div className="stack" style={{ gap: 14 }}>
            <div>
              <label className="label">Subject</label>
              <select className="select-input" value={subject} onChange={e => setSubject(e.target.value)}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Paste lesson text or instructions</label>
              <textarea
                className="textarea"
                style={{ minHeight: 120 }}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
            <div className="grid-2">
              <div>
                <label className="label">Due date</label>
                <input className="input" type="text" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Upload file (optional)</label>
                <input className="input" type="file" accept=".pdf,.doc,.docx" />
              </div>
            </div>
            <div>
              <label className="label">Assign to</label>
              <select className="select-input" value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                <option value="all">All students ({STUDENTS.length})</option>
                {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name} only</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary">Preview raw</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Adapt + assign with Gemma'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview of adapted version */}
        <div className="card">
          <div className="card-title">Preview — Jamie L. (visual · Bluey)</div>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '1rem', fontSize: 13, lineHeight: 1.7 }}>
            <div className="char-bubble">🐕 Bluey says: Pizza time!</div>
            <p style={{ marginBottom: 8 }}>
              Bluey and Bingo are sharing a pizza with <strong>8 slices</strong> — that's the bottom number!
              Bluey takes <strong>3</strong>, Bingo takes <strong>2</strong>. How many do they have together?
            </p>
            <div style={{
              background: 'var(--purple-light)', borderRadius: 8, padding: 12,
              textAlign: 'center', fontSize: 18, fontWeight: 500, color: 'var(--purple-dark)', margin: '10px 0',
            }}>
              ³⁄₈ + ²⁄₈ = ?
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Just add the top numbers! 3 + 2 = 5, so the answer is ⁵⁄₈.
            </p>
          </div>

          {/* Placeholder for Cloudinary image */}
          <div style={{
            marginTop: 12, background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 12, color: 'var(--teal-dark)',
          }}>
            📷 Cloudinary — themed character image will load here (pizza + Bluey illustration)
          </div>

          {/* ElevenLabs audio */}
          <div style={{
            marginTop: 8, background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 12, color: 'var(--blue-dark)',
          }}>
            🔊 ElevenLabs — narration audio will auto-play in auditory mode
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-secondary btn-sm">Regenerate</button>
            <button className="btn btn-primary btn-sm">Approve for Jamie</button>
          </div>
        </div>
      </div>
    </div>
  );
}
