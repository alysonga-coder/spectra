import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSIGNMENTS } from '../../lib/mockData';
import { Badge } from '../../components/UI';

const SUBJECT_ICONS = {
  Math: '➕', Reading: '📚', Science: '🔬', 'Social Skills': '🤝', Writing: '✏️',
};

export default function SelectAssignment() {
  const navigate = useNavigate();

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 500 }}>Your homework</div>

      {ASSIGNMENTS.map(a => {
        const isDone = a.status === 'done';
        return (
          <div
            key={a.id}
            className="card"
            style={{
              cursor: 'pointer',
              opacity: isDone ? 0.65 : 1,
              border: a.status === 'new' ? '2px solid var(--purple)' : '0.5px solid var(--border)',
              transition: 'all 0.15s',
              borderRadius: 'var(--radius)',
            }}
            onClick={() => navigate(`/student/lesson/${a.id}`)}
          >
            <div className="row-between" style={{ marginBottom: 6 }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 22 }}>{SUBJECT_ICONS[a.subject] || '📝'}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.subject} · Due {a.dueDate}</div>
                </div>
              </div>
              <Badge variant={isDone ? 'green' : a.status === 'in-progress' ? 'amber' : 'purple'}>
                {isDone ? 'Done ✓' : a.status === 'in-progress' ? 'In progress' : 'New'}
              </Badge>
            </div>
            {!isDone && (
              <div style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 500 }}>
                Tap to {a.status === 'in-progress' ? 'continue' : 'start'} →
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
