import React, { useState } from 'react';
import { STUDENTS, PAST_ASSIGNMENTS, REFRAME_EVENTS } from '../../lib/mockData';
import { StatCard, Avatar, Badge, ProgressBar, TlItem } from '../../components/UI';

const FLAGGED_PHRASES = ['i dont get it', 'this is too hard', 'can you explain', "i don't understand", 'what does this mean'];

const RECOMMENDATIONS = [
  { student: 'Jamie L.', rec: 'Bluey theme boosted engagement by 24% — use for all Math lessons going forward' },
  { student: 'Maya K.',  rec: 'ElevenLabs audio narration reduced "I don\'t understand" clicks by 50%' },
  { student: 'Eli R.',   rec: 'Default to Minecraft visual mode from session start — reduces frustration spike' },
  { student: 'Sofia B.', rec: 'Shorten math steps to 2 per question max for better completion rates' },
];

export default function TeacherReports() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const selectedData = PAST_ASSIGNMENTS.find(a => a.id === selectedAssignment);

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <div className="page-title">Reports & insights</div>
          <div className="page-sub">Review past assignments and student performance</div>
        </div>
        {selectedAssignment && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedAssignment(null)}
          >
            ← Back to all assignments
          </button>
        )}
      </div>

      {/* Assignment detail view */}
      {selectedData ? (
        <div>
          {/* Assignment header */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="row-between">
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{selectedData.title}</div>
                <div className="row" style={{ gap: 6, marginTop: 4 }}>
                  <Badge variant="blue">{selectedData.subject}</Badge>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Assigned {selectedData.assignedDate} · Due {selectedData.dueDate} · Completed {selectedData.completedDate}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {(() => {
                  const results = Object.values(selectedData.studentResults);
                  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
                  return (
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 500, color: avgScore >= 80 ? 'var(--teal)' : avgScore >= 60 ? 'var(--amber)' : 'var(--coral)' }}>
                        {avgScore}%
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Class average</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid-4" style={{ marginBottom: 12 }}>
            {(() => {
              const results = Object.values(selectedData.studentResults);
              const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
              const totalReframes = results.reduce((sum, r) => sum + r.reframes, 0);
              const totalCorrect = results.reduce((sum, r) => sum + r.questionsCorrect, 0);
              const totalQuestions = results.reduce((sum, r) => sum + r.questionsTotal, 0);
              return (
                <>
                  <StatCard label="Class average" value={`${avgScore}%`} valueColor="var(--teal)" />
                  <StatCard label="Total reframes" value={totalReframes} valueColor="var(--purple)" sub={`${results.length} students`} />
                  <StatCard label="Questions answered" value={`${totalCorrect}/${totalQuestions}`} valueColor="var(--blue)" />
                  <StatCard label="Students" value={results.length} />
                </>
              );
            })()}
          </div>

          {/* Per-student results table */}
          <div className="card">
            <div className="card-title">Student Results</div>
            {Object.entries(selectedData.studentResults).map(([studentId, result]) => {
              const student = STUDENTS.find(s => s.id === studentId);
              if (!student) return null;
              const scoreVariant = result.score >= 80 ? 'teal' : result.score >= 60 ? 'amber' : 'coral';

              return (
                <div key={studentId} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 6px', borderBottom: '0.5px solid var(--border)',
                }}>
                  <Avatar initials={student.initials} bg={student.avatarColor.bg} color={student.avatarColor.text} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{student.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.adaptedMode}</div>
                  </div>
                  <div style={{ width: 80 }}>
                    <ProgressBar pct={result.score} variant={scoreVariant} />
                  </div>
                  <div style={{ width: 45, textAlign: 'right', fontWeight: 500, fontSize: 13, color: `var(--${scoreVariant})` }}>
                    {result.score}%
                  </div>
                  <div style={{ width: 60, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                    {result.questionsCorrect}/{result.questionsTotal}
                  </div>
                  <div style={{ width: 55, textAlign: 'center' }}>
                    {result.reframes > 0 ? (
                      <Badge variant="purple">{result.reframes} reframe{result.reframes !== 1 ? 's' : ''}</Badge>
                    ) : (
                      <Badge variant="teal">None</Badge>
                    )}
                  </div>
                  <div style={{ width: 50, textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>
                    {result.timeSpent}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Default view — list of all past assignments + insights */
        <>
          {/* Past assignments list */}
          <div>
            <div className="card-title" style={{ marginBottom: 10 }}>Past Assignments</div>
            <div className="stack" style={{ gap: 10 }}>
              {PAST_ASSIGNMENTS.map(assignment => {
                const results = Object.values(assignment.studentResults);
                const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
                const totalReframes = results.reduce((sum, r) => sum + r.reframes, 0);

                return (
                  <div
                    key={assignment.id}
                    className="card"
                    style={{ cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onClick={() => setSelectedAssignment(assignment.id)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(83,74,183,0.10)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div className="row-between">
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{assignment.title}</div>
                        <div className="row" style={{ gap: 6, marginTop: 4 }}>
                          <Badge variant="blue">{assignment.subject}</Badge>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Due {assignment.dueDate} · Completed {assignment.completedDate}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 500, fontSize: 16, color: avgScore >= 80 ? 'var(--teal)' : avgScore >= 60 ? 'var(--amber)' : 'var(--coral)' }}>
                            {avgScore}%
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg score</div>
                        </div>
                        {totalReframes > 0 && (
                          <Badge variant="purple">{totalReframes} reframe{totalReframes !== 1 ? 's' : ''}</Badge>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 500 }}>View →</span>
                      </div>
                    </div>
                    {/* Mini student score row */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 8, borderTop: '0.5px solid var(--border)' }}>
                      {Object.entries(assignment.studentResults).map(([sid, r]) => {
                        const st = STUDENTS.find(s => s.id === sid);
                        if (!st) return null;
                        return (
                          <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                            <Avatar initials={st.initials} bg={st.avatarColor.bg} color={st.avatarColor.text} size={20} />
                            <span style={{ fontWeight: 500, color: r.score >= 80 ? 'var(--teal-dark)' : r.score >= 60 ? 'var(--amber-dark)' : 'var(--coral-dark)' }}>
                              {r.score}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights section */}
          <div className="grid-2" style={{ gap: 16, alignItems: 'start' }}>
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

            <div className="stack" style={{ gap: 12 }}>
              {/* Flagged language */}
              <div className="card">
                <div className="card-title">Flagged chat phrases</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {FLAGGED_PHRASES.map(p => (
                    <Badge key={p} variant="coral">{p}</Badge>
                  ))}
                </div>
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
        </>
      )}

    </div>
  );
}
