import React, { useState } from 'react';
import { STUDENTS, REFRAME_EVENTS } from '../../lib/mockData';
import { StatCard, Avatar, Badge, ProgressBar, TlItem } from '../../components/UI';

const DATE_RANGES = ['Today', 'This week', 'This month'];

const FLAGGED_PHRASES = ['i dont get it', 'this is too hard', 'can you explain', "i don't understand", 'what does this mean'];

const RECOMMENDATIONS = [
  { student: 'Jamie L.', rec: 'Bluey theme boosted engagement by 24% — use for all Math lessons going forward' },
  { student: 'Maya K.',  rec: 'ElevenLabs audio narration reduced "I don\'t understand" clicks by 50%' },
  { student: 'Eli R.',   rec: 'Default to Minecraft visual mode from session start — reduces frustration spike' },
  { student: 'Sofia B.', rec: 'Shorten math steps to 2 per question max for better completion rates' },
];

export default function TeacherReports() {
  const [range, setRange] = useState('Today');

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <div className="page-title">Reports & insights</div>
          <div className="page-sub">AI-generated summaries and engagement data</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {DATE_RANGES.map(r => (
            <button
              key={r}
              className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
          <button className="btn btn-secondary btn-sm">Export PDF</button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid-4">
        <StatCard label="Avg engagement"    value="74%" valueColor="var(--teal)" />
        <StatCard label="Total AI reframes" value={9}   valueColor="var(--purple)" sub="3 students" />
        <StatCard label="Frustration events" value={14} valueColor="var(--coral)" />
        <StatCard label="Completed lessons" value={4}   valueColor="var(--teal)" />
      </div>

      <div className="grid-2" style={{ gap: 16, alignItems: 'start' }}>

        {/* Per-student table */}
        <div className="card">
          <div className="card-title">Per-student summary</div>
          {STUDENTS.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 'var(--radius-sm)' }}>
              <Avatar initials={s.initials} bg={s.avatarColor.bg} color={s.avatarColor.text} size={30} />
              <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{s.name}</span>
              <div style={{ width: 90 }}>
                <ProgressBar
                  pct={s.engagementPct}
                  variant={s.frustrationLevel === 'high' ? 'coral' : s.frustrationLevel === 'moderate' ? 'amber' : 'teal'}
                />
              </div>
              <span style={{ fontSize: 12, width: 32, textAlign: 'right' }}>{s.engagementPct}%</span>
              <Badge variant={s.frustrationLevel === 'high' ? 'coral' : s.frustrationLevel === 'moderate' ? 'amber' : 'teal'}>
                {s.frustrationLevel.charAt(0).toUpperCase() + s.frustrationLevel.slice(1)}
              </Badge>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="stack" style={{ gap: 12 }}>

          {/* Flagged language */}
          <div className="card">
            <div className="card-title">Flagged chat phrases today</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FLAGGED_PHRASES.map(p => (
                <Badge key={p} variant="coral">{p}</Badge>
              ))}
            </div>
          </div>

          {/* Reframe log */}
          <div className="card">
            <div className="card-title">AI reframe log</div>
            {REFRAME_EVENTS.map((ev, i) => (
              <TlItem
                key={i}
                text={<>
                  <strong>{STUDENTS.find(s => s.id === ev.studentId)?.name}</strong>
                  {' — '}{ev.before !== '—' && `${ev.before} → `}{ev.after}
                </>}
                time={ev.timestamp}
                color={ev.color}
              />
            ))}
          </div>

          {/* AI recommendations */}
          <div className="card">
            <div className="card-title">AI recommendations</div>
            {RECOMMENDATIONS.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: i < RECOMMENDATIONS.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0, marginTop: 5 }} />
                <div style={{ fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{r.student}</span> — {r.rec}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
