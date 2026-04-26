import React, { useState, useEffect } from 'react';
import { REPORT_ASSIGNMENTS, REPORT_SUBJECT_META } from '../../lib/mockData';
import { Avatar, Badge, ProgressBar } from '../../components/UI';
import { useAuth } from '../../lib/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderBoldMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

const TABS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'per-student', label: 'Per student' },
  { key: 'questions',   label: 'Questions' },
  { key: 'insights',    label: 'Insights' },
];

const SUBJECT_ORDER = ['Mathematics', 'Reading', 'Science', 'Social Skills'];

function groupBySubject(assignments) {
  const grouped = {};
  assignments.forEach(a => {
    if (!grouped[a.subject]) grouped[a.subject] = [];
    grouped[a.subject].push(a);
  });
  return grouped;
}

// ---------- Overview Tab ----------
function OverviewTab({ assignment, enrolledStudents, submissions }) {
  const studentSubs = enrolledStudents.map(s => submissions[`${assignment.id}_${s.id}`]).filter(Boolean);
  const completedSubs = studentSubs.filter(s => s.status === 'completed');
  const totalStudents = enrolledStudents.length;
  const completedCount = completedSubs.length;

  if (completedCount === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No results yet</div>
        <div style={{ fontSize: 13 }}>
          Results will appear here once students complete this assignment.
          {totalStudents > 0 && ` ${totalStudents} student${totalStudents !== 1 ? 's' : ''} enrolled.`}
        </div>
      </div>
    );
  }

  const avgScore = Math.round(completedSubs.reduce((sum, s) => sum + (s.score || 0), 0) / completedCount);
  const completionPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  const totalReframes = completedSubs.reduce((sum, s) => sum + (s.reframes || 0), 0);

  // Group scores by learning style
  const styleScores = {};
  completedSubs.forEach(sub => {
    const student = enrolledStudents.find(s => s.id === sub.studentUid);
    const style = (student?.learningStyles || ['Visual'])[0] || 'Visual';
    if (!styleScores[style]) styleScores[style] = [];
    styleScores[style].push(sub.score || 0);
  });
  const styleColors = { Visual: 'var(--purple)', Auditory: 'var(--teal)', Reading: 'var(--amber)', Kinesthetic: 'var(--blue)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'AVG SCORE', value: `${avgScore}%`, sub: `across ${completedCount} student${completedCount !== 1 ? 's' : ''}`, color: avgScore >= 75 ? 'var(--teal)' : avgScore >= 60 ? 'var(--amber)' : 'var(--coral)' },
          { label: 'COMPLETION', value: `${completionPct}%`, sub: `${completedCount} of ${totalStudents} finished`, color: 'var(--teal)' },
          { label: 'AI REFRAMES', value: totalReframes, sub: `${completedSubs.filter(s => (s.reframes || 0) > 0).length} student${completedSubs.filter(s => (s.reframes || 0) > 0).length !== 1 ? 's' : ''} triggered`, color: totalReframes > 3 ? 'var(--coral)' : 'var(--text)' },
          { label: 'AVG QUESTIONS', value: completedSubs.length > 0 ? `${Math.round(completedSubs.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0) / completedCount)}/${Math.round(completedSubs.reduce((sum, s) => sum + (s.questionsTotal || 0), 0) / completedCount)}` : '—', sub: 'correct per student', color: 'var(--teal)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {Object.keys(styleScores).length > 0 && (
        <div className="card">
          <div className="card-title">SCORE BY LEARNING STYLE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(styleScores).map(([style, scores]) => {
              const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              return (
                <div key={style} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 80, fontSize: 12, textAlign: 'right' }}>{style}</span>
                  <div style={{ flex: 1, height: 12, background: 'var(--gray-light)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${avg}%`, height: '100%', background: styleColors[style] || 'var(--purple)', borderRadius: 6 }} />
                  </div>
                  <span style={{ width: 35, fontSize: 12, fontWeight: 500 }}>{avg}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Per Student Tab ----------
function PerStudentTab({ assignment, enrolledStudents, submissions }) {
  if (enrolledStudents.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No students enrolled yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>INDIVIDUAL STUDENT PERFORMANCE</div>
          <Badge variant="gray">{enrolledStudents.length} students</Badge>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '180px 80px 120px 80px 80px 1fr',
          gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4,
        }}>
          <div>Student</div>
          <div>Mode</div>
          <div>Score</div>
          <div>Correct</div>
          <div>Reframes</div>
          <div>Status</div>
        </div>

        {enrolledStudents.map(student => {
          const sub = submissions[`${assignment.id}_${student.id}`];
          const style = (student.learningStyles || ['Visual'])[0] || 'Visual';

          if (!sub || sub.status !== 'completed') {
            return (
              <div key={student.id} style={{
                display: 'grid', gridTemplateColumns: '180px 80px 120px 80px 80px 1fr',
                gap: 8, padding: '12px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials={student.initials} bg={student.avatarColor.bg} color={student.avatarColor.text} size={28} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{student.name}</span>
                </div>
                <div><Badge variant="blue">{style}</Badge></div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</div>
                <div><Badge variant="gray">Not completed</Badge></div>
              </div>
            );
          }

          const score = sub.score || 0;
          const scoreColor = score >= 80 ? 'teal' : score >= 60 ? 'amber' : 'coral';

          return (
            <div key={student.id} style={{
              display: 'grid', gridTemplateColumns: '180px 80px 120px 80px 80px 1fr',
              gap: 8, padding: '12px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar initials={student.initials} bg={student.avatarColor.bg} color={student.avatarColor.text} size={28} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{student.name}</span>
              </div>
              <div><Badge variant={style === 'Auditory' ? 'amber' : style === 'Reading' ? 'purple' : 'blue'}>{style}</Badge></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ProgressBar pct={score} variant={scoreColor} />
                <span style={{ fontSize: 12, fontWeight: 500, minWidth: 32 }}>{score}%</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{sub.questionsCorrect || 0}/{sub.questionsTotal || 0}</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 500,
                  background: (sub.reframes || 0) > 0 ? ((sub.reframes || 0) >= 3 ? 'var(--coral-light)' : 'var(--amber-light)') : 'var(--teal-light)',
                  color: (sub.reframes || 0) > 0 ? ((sub.reframes || 0) >= 3 ? 'var(--coral-dark)' : 'var(--amber-dark)') : 'var(--teal-dark)',
                }}>{sub.reframes || 0}</span>
              </div>
              <div><Badge variant="teal">Completed</Badge></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Questions Tab ----------
function QuestionsTab({ assignment, submissions, enrolledStudents }) {
  const studentSubs = enrolledStudents.map(s => submissions[`${assignment.id}_${s.id}`]).filter(s => s && s.status === 'completed');

  if (studentSubs.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No question data yet</div>
        <div style={{ fontSize: 13 }}>
          Detailed question analysis will appear once students complete this assignment.
        </div>
      </div>
    );
  }

  const avgCorrect = Math.round(studentSubs.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0) / studentSubs.length);
  const avgTotal = Math.round(studentSubs.reduce((sum, s) => sum + (s.questionsTotal || 0), 0) / studentSubs.length);
  const avgPct = avgTotal > 0 ? Math.round((avgCorrect / avgTotal) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card">
        <div className="card-title">AGGREGATE QUESTION PERFORMANCE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: avgPct >= 75 ? 'var(--teal)' : avgPct >= 60 ? 'var(--amber)' : 'var(--coral)' }}>{avgPct}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg accuracy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)' }}>{avgCorrect}/{avgTotal}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg correct/total</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)' }}>{studentSubs.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Submissions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Insights Tab ----------
function InsightsTab({ assignment, enrolledStudents, submissions }) {
  const studentSubs = enrolledStudents.map(s => submissions[`${assignment.id}_${s.id}`]).filter(s => s && s.status === 'completed');

  if (studentSubs.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No insights yet</div>
        <div style={{ fontSize: 13 }}>
          AI-generated insights will appear once students complete this assignment.
        </div>
      </div>
    );
  }

  const avgScore = Math.round(studentSubs.reduce((sum, s) => sum + (s.score || 0), 0) / studentSubs.length);
  const totalReframes = studentSubs.reduce((sum, s) => sum + (s.reframes || 0), 0);
  const insights = [];

  if (avgScore < 60) {
    insights.push({ type: 'warning', text: `**Average score is ${avgScore}%** — this assignment may be too difficult for the current class level. Consider simplifying or breaking it into smaller steps.` });
  } else if (avgScore >= 85) {
    insights.push({ type: 'positive', text: `**Great results!** Average score of ${avgScore}% shows strong understanding. Students are ready to move to more challenging material.` });
  }

  if (totalReframes > 0) {
    insights.push({ type: 'amber', text: `**${totalReframes} AI reframe${totalReframes !== 1 ? 's' : ''} triggered** during this assignment. Review which students needed extra help and consider adjusting their learning profiles.` });
  }

  enrolledStudents.forEach(student => {
    const sub = submissions[`${assignment.id}_${student.id}`];
    if (sub && sub.status === 'completed' && (sub.score || 0) < 50) {
      insights.push({ type: 'amber', text: `**${student.name} scored ${sub.score}%** on this assignment. Consider a 1:1 check-in or adjusting their learning style/difficulty.` });
    }
  });

  if (insights.length === 0) {
    insights.push({ type: 'info', text: `**${studentSubs.length} student${studentSubs.length !== 1 ? 's' : ''} completed this assignment.** All results look healthy. Keep up the great work!` });
  }

  const bgMap = { warning: 'var(--coral-light)', amber: 'var(--amber-light)', info: '#D9EEFA', positive: 'var(--green-light)' };
  const iconMap = { warning: '⚠', amber: '◆', info: '◉', positive: '✓' };
  const colorMap = { warning: 'var(--coral-dark)', amber: 'var(--amber-dark)', info: 'var(--blue-dark)', positive: 'var(--green-dark)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card-title">INSIGHTS FOR THIS ASSIGNMENT</div>
      {insights.map((insight, i) => (
        <div key={i} style={{
          padding: '16px 20px', borderRadius: 10,
          background: bgMap[insight.type] || 'var(--gray-light)',
          lineHeight: 1.6, fontSize: 13,
          color: colorMap[insight.type] || 'var(--text)',
        }}>
          <span style={{ marginRight: 8 }}>{iconMap[insight.type]}</span>
          <span dangerouslySetInnerHTML={{ __html: renderBoldMarkdown(insight.text) }} />
        </div>
      ))}
    </div>
  );
}

// ---------- Main Reports Page ----------
export default function TeacherReports() {
  const { userProfile } = useAuth();
  const [selectedId, setSelectedId] = useState(REPORT_ASSIGNMENTS[0]?.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSubjects, setExpandedSubjects] = useState(SUBJECT_ORDER);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});

  const classCodes = (userProfile?.classes || []).map(c => c.code).filter(Boolean);

  // Fetch real enrolled students
  useEffect(() => {
    if (!classCodes.length) return;
    async function fetchStudents() {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'), where('classCode', 'in', classCodes.slice(0, 10)));
        const snap = await getDocs(q);
        const students = snap.docs.map(d => {
          const data = d.data();
          const name = data.name || 'Student';
          const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return {
            id: d.id,
            name,
            initials,
            grade: data.grade || '',
            avatarColor: { bg: '#E6F1FB', text: '#042C53' },
            learningStyles: data.learningStyles || [],
            characters: data.characters || [],
          };
        });
        setEnrolledStudents(students);
      } catch (e) {
        console.error('Failed to fetch enrolled students:', e);
      }
    }
    fetchStudents();
  }, [classCodes.join(',')]);

  // Fetch all submissions
  useEffect(() => {
    if (!userProfile?.uid) return;
    async function fetchSubmissions() {
      try {
        const q = query(collection(db, 'submissions'), where('teacherUid', '==', userProfile.uid));
        const snap = await getDocs(q);
        const subs = {};
        snap.forEach(d => {
          const data = d.data();
          const key = `${data.assignmentId}_${data.studentUid}`;
          subs[key] = data;
        });
        setSubmissions(subs);
      } catch (e) {
        console.error('Failed to fetch submissions:', e);
      }
    }
    fetchSubmissions();
  }, [userProfile?.uid]);

  const selected = REPORT_ASSIGNMENTS.find(a => a.id === selectedId) || REPORT_ASSIGNMENTS[0];
  const grouped = groupBySubject(REPORT_ASSIGNMENTS);

  // Compute real student count and submission count for header
  const completedCount = enrolledStudents.filter(s => submissions[`${selected.id}_${s.id}`]?.status === 'completed').length;
  const totalReframes = enrolledStudents.reduce((sum, s) => {
    const sub = submissions[`${selected.id}_${s.id}`];
    return sum + (sub?.reframes || 0);
  }, 0);

  function toggleSubject(subject) {
    setExpandedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
      {/* ---- Sidebar ---- */}
      <div style={{
        width: 280, flexShrink: 0, borderRight: '0.5px solid var(--border)',
        overflowY: 'auto', background: 'var(--surface)',
      }}>
        <div style={{ padding: '20px 20px 12px' }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Reports</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grouped by subject</div>
        </div>

        {SUBJECT_ORDER.filter(s => grouped[s]).map(subject => {
          const meta = REPORT_SUBJECT_META[subject] || {};
          const isExpanded = expandedSubjects.includes(subject);
          const items = grouped[subject];

          return (
            <div key={subject}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 20px', cursor: 'pointer',
                }}
                onClick={() => toggleSubject(subject)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{subject}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && items.map(a => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 20px 7px 44px', cursor: 'pointer', fontSize: 13,
                    fontWeight: a.id === selectedId ? 500 : 400,
                    background: a.id === selectedId ? 'var(--bg)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onClick={() => { setSelectedId(a.id); setActiveTab('overview'); }}
                  onMouseEnter={e => { if (a.id !== selectedId) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { if (a.id !== selectedId) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: `var(--${a.dot})`,
                  }} />
                  <span style={{ flex: 1 }}>{a.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{a.date}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ---- Main content ---- */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 20 }}>
            {selected.subject} — {selected.title} ({selected.date})
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''} enrolled · {completedCount} completed · {totalReframes} reframe{totalReframes !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: activeTab === tab.key ? 'var(--text)' : 'var(--bg)',
                color: activeTab === tab.key ? '#fff' : 'var(--text)',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab assignment={selected} enrolledStudents={enrolledStudents} submissions={submissions} />}
        {activeTab === 'per-student' && <PerStudentTab assignment={selected} enrolledStudents={enrolledStudents} submissions={submissions} />}
        {activeTab === 'questions' && <QuestionsTab assignment={selected} enrolledStudents={enrolledStudents} submissions={submissions} />}
        {activeTab === 'insights' && <InsightsTab assignment={selected} enrolledStudents={enrolledStudents} submissions={submissions} />}
      </div>
    </div>
  );
}
