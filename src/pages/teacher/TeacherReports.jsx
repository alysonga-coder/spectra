import React, { useState } from 'react';
import { STUDENTS, PUBLISHED_ASSIGNMENTS, PAST_ASSIGNMENTS, REPORT_SUBJECT_META } from '../../lib/mockData';
import { Avatar, Badge, ProgressBar } from '../../components/UI';

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

// Build a unified list of assignments for the reports sidebar from actual assignment data
const ALL_REPORT_ITEMS = [
  ...PUBLISHED_ASSIGNMENTS.map(a => ({
    id: a.id,
    subject: a.subject === 'Math' ? 'Mathematics' : a.subject,
    title: a.title,
    date: a.dueDate ? a.dueDate.replace(', 2026', '') : '',
    dot: 'teal',
    isCurrent: true,
  })),
  ...PAST_ASSIGNMENTS.map(a => ({
    id: a.id,
    subject: a.subject === 'Math' ? 'Mathematics' : a.subject,
    title: a.title,
    date: a.completedDate ? a.completedDate.replace(', 2026', '') : '',
    dot: 'purple',
    isCurrent: false,
  })),
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
  const studentSubs = enrolledStudents.map(s => {
    const sub = submissions[`${assignment.id}_${s.id}`];
    return sub ? { ...sub, student: s } : null;
  }).filter(s => s && s.status === 'completed');

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

  // --- Overall assignment insight ---
  if (avgScore < 60) {
    insights.push({ type: 'warning', text: `**Average score is ${avgScore}%** — this assignment may be too difficult for the current class level. Consider simplifying the content or breaking it into smaller, scaffolded steps before the next session.` });
  } else if (avgScore >= 85) {
    insights.push({ type: 'positive', text: `**Great results!** Average score of ${avgScore}% shows strong understanding across the class. Students are ready to move to more challenging material on this topic.` });
  } else {
    insights.push({ type: 'info', text: `**Class average: ${avgScore}%.** This is within the target range. Most students demonstrated solid comprehension with room for growth.` });
  }

  // --- Frustration detector insights ---
  if (totalReframes > 0) {
    const studentsWithReframes = studentSubs.filter(s => (s.reframes || 0) > 0);
    const reframedNames = studentsWithReframes.map(s => s.student.name).join(', ');
    insights.push({ type: 'amber', text: `**Frustration detector triggered ${totalReframes} AI reframe${totalReframes !== 1 ? 's' : ''}** for ${studentsWithReframes.length} student${studentsWithReframes.length !== 1 ? 's' : ''} (${reframedNames}). The system detected signals like rapid clicks, repeated wrong answers, or "I don't understand" responses and automatically adapted the lesson content.` });
  } else {
    insights.push({ type: 'positive', text: `**Zero frustration signals detected.** No students triggered the frustration detector on this assignment — the difficulty level and pacing were well-calibrated for the class.` });
  }

  // --- Per-student insights ---
  const sorted = [...studentSubs].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topStudent = sorted[0];
  const bottomStudent = sorted[sorted.length - 1];

  // Top performer
  if (topStudent && (topStudent.score || 0) >= 80) {
    const style = (topStudent.student.learningStyles || [])[0] || 'their preferred';
    insights.push({ type: 'positive', text: `**${topStudent.student.name} excelled with ${topStudent.score}%** using ${style} mode. ${(topStudent.reframes || 0) === 0 ? 'Completed without any AI intervention — ready for advanced material on this topic.' : 'Even with reframes, showed strong recovery and mastery.'}` });
  }

  // Struggling student
  if (bottomStudent && (bottomStudent.score || 0) < 70 && bottomStudent !== topStudent) {
    const triggers = (bottomStudent.student.frustrationTriggers || []).join(', ').toLowerCase();
    const frustLevel = bottomStudent.student.frustrationLevel;
    let advice = 'Consider a 1:1 check-in to discuss what felt challenging.';
    if (frustLevel === 'high') {
      advice = `This student's frustration level is currently **high** (score: ${bottomStudent.student.frustrationScore}/100). Recommend a 1:1 check-in before the next assignment. Known triggers: ${triggers || 'not yet identified'}.`;
    } else if ((bottomStudent.reframes || 0) >= 2) {
      advice = `Needed ${bottomStudent.reframes} reframes to get through the material. The AI adapted the content each time, but the student may benefit from pre-teaching key concepts before the next assignment.`;
    }
    insights.push({ type: 'amber', text: `**${bottomStudent.student.name} needs additional support (${bottomStudent.score}%).** ${advice}` });
  }

  // Students with high frustration levels (from their overall profile, not just this assignment)
  enrolledStudents.forEach(student => {
    if (student.frustrationLevel === 'high') {
      const sub = submissions[`${assignment.id}_${student.id}`];
      const alreadyMentioned = bottomStudent && bottomStudent.student.id === student.id;
      if (!alreadyMentioned) {
        const reframeCount = sub?.reframes || 0;
        insights.push({ type: 'warning', text: `**Frustration alert: ${student.name}** has a frustration score of ${student.frustrationScore}/100 across recent sessions. ${reframeCount > 0 ? `Triggered ${reframeCount} reframe${reframeCount !== 1 ? 's' : ''} on this assignment.` : 'Did not trigger reframes here, but overall patterns suggest they need closer monitoring.'} Known triggers: ${(student.frustrationTriggers || []).join(', ') || 'unknown'}.` });
      }
    }
  });

  // Learning style comparison
  const styleScores = {};
  studentSubs.forEach(s => {
    const style = (s.student.learningStyles || [])[0] || 'Unknown';
    if (!styleScores[style]) styleScores[style] = [];
    styleScores[style].push(s.score || 0);
  });
  const styleAvgs = Object.entries(styleScores).map(([style, scores]) => ({
    style,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  })).sort((a, b) => b.avg - a.avg);

  if (styleAvgs.length >= 2) {
    const best = styleAvgs[0];
    const worst = styleAvgs[styleAvgs.length - 1];
    const gap = best.avg - worst.avg;
    if (gap >= 15) {
      insights.push({ type: 'info', text: `**Learning style gap: ${best.style} learners averaged ${best.avg}% vs ${worst.style} learners at ${worst.avg}%** (${gap}pt difference). Consider adjusting the ${worst.style.toLowerCase()} mode content — it may need additional scaffolding, slower pacing, or supplementary materials to close this gap.` });
    } else if (gap < 10) {
      insights.push({ type: 'positive', text: `**All learning styles performed similarly** (${gap}pt spread). The adaptive content is working well across Visual, Auditory, Kinesthetic, and Reading modes.` });
    }
  }

  // Mid-range students who might be overlooked
  sorted.forEach(s => {
    const score = s.score || 0;
    if (score >= 60 && score < 75 && s !== topStudent && s !== bottomStudent) {
      insights.push({ type: 'info', text: `**${s.student.name} scored ${score}%** — not struggling, but not thriving either. A small nudge could help: try adding their favorite character (${(s.student.characters || ['their preferred character'])[0]}) to more of the lesson content, or switch to a ${(s.student.learningStyles || ['different'])[0].toLowerCase()}-first approach.` });
    }
  });

  // Recommendations section
  const recommendations = [];
  if (totalReframes > 2) {
    recommendations.push('Review and simplify question wording for the next assignment on this topic');
  }
  if (bottomStudent && (bottomStudent.score || 0) < 60) {
    recommendations.push(`Schedule a 1:1 check-in with ${bottomStudent.student.name} before the next similar assignment`);
  }
  enrolledStudents.forEach(student => {
    if (student.frustrationLevel === 'high') {
      recommendations.push(`Monitor ${student.name}'s frustration signals closely — consider reducing assignment length or adding more breaks`);
    }
  });
  if (styleAvgs.length >= 2 && (styleAvgs[0].avg - styleAvgs[styleAvgs.length - 1].avg) >= 15) {
    recommendations.push(`Enhance ${styleAvgs[styleAvgs.length - 1].style.toLowerCase()} mode content with additional support materials`);
  }
  if (topStudent && (topStudent.score || 0) >= 90) {
    recommendations.push(`Consider giving ${topStudent.student.name} an extension activity or advanced version`);
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

      {recommendations.length > 0 && (
        <>
          <div className="card-title" style={{ marginTop: 12 }}>RECOMMENDATIONS</div>
          <div style={{
            padding: '16px 20px', borderRadius: 10,
            background: 'var(--gray-light)', lineHeight: 1.8, fontSize: 13,
          }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--purple)', fontWeight: 600 }}>→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Main Reports Page ----------
// Build fake submissions from PAST_ASSIGNMENTS for demo
const MOCK_SUBMISSIONS = {};
PAST_ASSIGNMENTS.forEach(pa => {
  Object.entries(pa.studentResults || {}).forEach(([sid, result]) => {
    MOCK_SUBMISSIONS[`${pa.id}_${sid}`] = {
      assignmentId: pa.id,
      studentUid: sid,
      status: 'completed',
      score: result.score,
      questionsCorrect: result.questionsCorrect,
      questionsTotal: result.questionsTotal,
      reframes: result.reframes,
    };
  });
});

export default function TeacherReports() {
  const [selectedId, setSelectedId] = useState(ALL_REPORT_ITEMS[0]?.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSubjects, setExpandedSubjects] = useState(SUBJECT_ORDER);

  const enrolledStudents = STUDENTS;
  const submissions = MOCK_SUBMISSIONS;

  const selected = ALL_REPORT_ITEMS.find(a => a.id === selectedId) || ALL_REPORT_ITEMS[0];
  const grouped = groupBySubject(ALL_REPORT_ITEMS);

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
