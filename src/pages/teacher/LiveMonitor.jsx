import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDENTS, REFRAME_EVENTS, statusBadgeClass, statusLabel } from '../../lib/mockData';
import { Avatar, Badge, StatusDot, FrustrationBar, SigRow, TlItem, Alert } from '../../components/UI';

export default function LiveMonitor() {
  const navigate          = useNavigate();
  const [selected, setSelected] = useState(null);
  const [tick, setTick]   = useState(0);

  // Simulate live updates every 5 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const student = selected ? STUDENTS.find(s => s.id === selected) : null;

  const sigValues = {
    calm:    { clicks: '0 in 60s',  wrong: '0',  idk: '0',  time: '42s',    chat: 'None flagged' },
    alert:   { clicks: '3 in 8s',   wrong: '2',  idk: '2',  time: '1m 42s', chat: '2 phrases' },
    stress:  { clicks: '7 in 12s',  wrong: '4',  idk: '3',  time: '3m 10s', chat: '4 phrases' },
    offline: { clicks: '—',         wrong: '—',  idk: '—',  time: '—',      chat: '—' },
  };

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <div className="page-title">Live monitor</div>
          <div className="page-sub">
            Real-time frustration signals · Updates every 5s · {tick > 0 && `Last refresh: ${tick * 5}s ago`}
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: 4 }} />
            Sound alerts
          </label>
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: 4 }} />
            Notifications
          </label>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, alignItems: 'start' }}>

        {/* Student roster */}
        <div className="card">
          <div className="card-title">Student roster — click to inspect</div>
          {STUDENTS.map(s => (
            <div
              key={s.id}
              onClick={() => setSelected(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background 0.1s',
                background: selected === s.id ? 'var(--teal-light)' : s.status === 'stress' ? 'var(--coral-light)' : 'transparent',
                marginBottom: 4,
              }}
            >
              <StatusDot status={s.status} />
              <Avatar initials={s.initials} bg={s.avatarColor.bg} color={s.avatarColor.text} size={32} />
              <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{s.name}</span>
              <Badge variant={statusBadgeClass(s.status)}>{statusLabel(s.status)}</Badge>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="card">
          {!student ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
              Click a student to see their live signals and session log
            </div>
          ) : (
            <>
              <div className="row" style={{ gap: 10, marginBottom: 16 }}>
                <Avatar initials={student.initials} bg={student.avatarColor.bg} color={student.avatarColor.text} size={40} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{student.grade}</div>
                </div>
                <Badge variant={statusBadgeClass(student.status)} style={{ marginLeft: 'auto' }}>
                  {statusLabel(student.status)}
                </Badge>
              </div>

              <SigRow label="Rapid button clicks"       value={sigValues[student.status].clicks} valueColor={student.status === 'stress' ? 'var(--coral)' : undefined} />
              <SigRow label="Consecutive wrong answers" value={sigValues[student.status].wrong}  valueColor={student.status === 'stress' ? 'var(--coral)' : undefined} />
              <SigRow label={'"I don\'t understand" presses'} value={sigValues[student.status].idk} valueColor={student.status !== 'calm' && student.status !== 'offline' ? 'var(--amber-dark)' : undefined} />
              <SigRow label="Time on current question"  value={sigValues[student.status].time} />
              <SigRow label="Flagged language in chat"  value={sigValues[student.status].chat} valueColor={student.status === 'stress' ? 'var(--coral)' : undefined} />

              <div style={{ marginTop: 14 }}>
                <FrustrationBar score={student.frustrationScore} />
              </div>

              {student.status === 'stress' && (
                <Alert variant="danger" style={{ marginTop: 12 }}>
                  AI has auto-reframed to {student.characters[0]} visual mode. Recommend a check-in.
                </Alert>
              )}

              <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm">Manual reframe</button>
                <button className="btn btn-secondary btn-sm">Send break prompt</button>
                {student.status === 'stress' && (
                  <button className="btn btn-danger btn-sm" onClick={() => alert('Check-in sent to student screen!')}>
                    Check in now
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reframe event feed */}
      <div className="card">
        <div className="card-title">AI reframe feed — today</div>
        {REFRAME_EVENTS.map((ev, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <TlItem
              text={<><strong>{STUDENTS.find(s => s.id === ev.studentId)?.name}</strong> — {ev.trigger}: {ev.after}</>}
              time={ev.timestamp}
              color={ev.color}
            />
          </div>
        ))}
      </div>

    </div>
  );
}
