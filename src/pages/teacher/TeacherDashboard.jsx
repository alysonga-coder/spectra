import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PUBLISHED_ASSIGNMENTS, PAST_ASSIGNMENTS, statusBadgeClass, statusLabel } from '../../lib/mockData';
import { StatCard, Alert, Avatar, StatusDot, Badge, ProgressBar } from '../../components/UI';
import { useAuth } from '../../lib/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});

  const teacherName = userProfile?.name || 'Teacher';
  const teacherRoom = userProfile?.room || 'Classroom';
  const classCodes = (userProfile?.classes || []).map(c => c.code).filter(Boolean);

  useEffect(() => {
    if (!classCodes.length) return;
    async function fetchStudents() {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'), where('classCode', 'in', classCodes.slice(0, 10)));
        const snap = await getDocs(q);
        const enrolled = snap.docs.map(d => {
          const data = d.data();
          const name = data.name || 'Student';
          const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return {
            id: d.id,
            firestoreStudent: true,
            name,
            initials,
            grade: data.grade || '',
            avatarColor: { bg: '#E6F1FB', text: '#042C53' },
            learningStyles: data.learningStyles || [],
            allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
            characters: data.characters || [],
            allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
            sensoryPrefs: data.sensoryPrefs || [],
            frustrationTriggers: data.frustrationTriggers || [],
            engagementPct: 0,
            frustrationLevel: 'low',
            frustrationScore: 0,
            status: 'offline',
            sessionActive: false,
            frustrationHistory: [0, 0, 0, 0, 0, 0, 0],
            currentAssignment: null,
          };
        });
        setEnrolledStudents(enrolled);
      } catch (e) {
        console.error('Failed to fetch enrolled students:', e);
      }
    }
    fetchStudents();
  }, [classCodes.join(',')]);

  // Fetch submissions
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

  const allStudents = enrolledStudents;
  const highFrustration = allStudents.filter(s => s.status === 'stress');

  // Build current assignments with real student data
  const currentAssignments = PUBLISHED_ASSIGNMENTS.map(pa => {
    const totalCount = allStudents.length;
    let completedCount = 0;
    allStudents.forEach(s => {
      const sub = submissions[`${pa.id}_${s.id}`];
      if (sub && sub.status === 'completed') completedCount++;
    });
    return { ...pa, completedCount, totalCount };
  });

  // Build past assignments with real student data
  const pastAssignments = PAST_ASSIGNMENTS.map(pa => {
    let totalScore = 0;
    let scoredCount = 0;
    allStudents.forEach(s => {
      const sub = submissions[`${pa.id}_${s.id}`];
      if (sub && sub.status === 'completed' && sub.score != null) {
        totalScore += sub.score;
        scoredCount++;
      }
    });
    const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;
    return { ...pa, avgScore, scoredCount };
  });

  // Count total completed submissions
  const totalCompleted = Object.values(submissions).filter(s => s.status === 'completed').length;

  return (
    <div className="page">

      {/* Frustration alert strip */}
      {highFrustration.map(s => (
        <Alert key={s.id} variant="danger">
          <StatusDot status="stress" />
          <div>
            <strong>{s.name}</strong> — high frustration detected. AI has auto-reframed.{' '}
            <span
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => navigate(`/teacher/profile/${s.id}`)}
            >
              View student profile →
            </span>
          </div>
        </Alert>
      ))}

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{teacherRoom} — {teacherName}</div>
          <div className="page-sub">
            {allStudents.filter(s => s.sessionActive).length} active sessions · {allStudents.length} students total
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/upload')}>
          + Upload lesson
        </button>
      </div>

      {/* Stats row */}
      <div className="grid-4">
        <StatCard label="Students"       value={allStudents.length} />
        <StatCard label="Lessons today"  value={PUBLISHED_ASSIGNMENTS.length} sub={`${totalCompleted} submission${totalCompleted !== 1 ? 's' : ''}`} />
        <StatCard label="Avg engagement" value={allStudents.length > 0 ? '—' : '—'} valueColor="var(--purple)" />
        <StatCard label="AI reframes"    value={0}  valueColor="var(--coral)" sub="today" />
      </div>

      {/* Student grid */}
      <div>
        <div className="card-title" style={{ marginBottom: 10 }}>Students</div>
        {allStudents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No students enrolled yet. Share your class code to get started.
          </div>
        ) : (
          <div className="grid-2">
            {allStudents.map(student => (
              <div
                key={student.id}
                className="card"
                style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => navigate(`/teacher/profile/${student.id}`)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = ''}
              >
                {/* Top row: avatar + name + status */}
                <div className="row-between" style={{ marginBottom: 10 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <Avatar
                      initials={student.initials}
                      bg={student.avatarColor.bg}
                      color={student.avatarColor.text}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</div>
                      <div className="row" style={{ gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                        {student.learningStyles.map(s => (
                          <Badge key={s} variant="blue">{s}</Badge>
                        ))}
                        {student.characters.slice(0, 1).map(c => (
                          <Badge key={c} variant="purple">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <StatusDot status={student.status} />
                    <Badge variant={statusBadgeClass(student.status)}>
                      {statusLabel(student.status)}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar
                  pct={student.engagementPct}
                  variant={student.frustrationLevel === 'high' ? 'coral' : student.frustrationLevel === 'moderate' ? 'amber' : 'teal'}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {student.status === 'stress'
                    ? <span style={{ color: 'var(--coral-dark)', fontWeight: 500 }}>High frustration detected</span>
                    : student.sessionActive
                      ? `Engagement ${student.engagementPct}%`
                      : 'Offline'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Assignments & Past Assignments bubbles */}
      <div className="grid-2" style={{ gap: 16 }}>

        {/* Current Assignments — bottom left */}
        <div
          className="card"
          style={{ cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
          onClick={() => navigate('/teacher/upload')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(29,158,117,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <div className="row" style={{ gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--teal-light)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>
              📋
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Current Assignments</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {currentAssignments.length} active assignment{currentAssignments.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          {currentAssignments.slice(0, 2).map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: '0.5px solid var(--border)', fontSize: 12 }}>
              <div>
                <span style={{ fontWeight: 500 }}>{a.title}</span>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Due {a.dueDate}</div>
              </div>
              <Badge variant="teal">{a.completedCount}/{a.totalCount}</Badge>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 500, marginTop: 8, textAlign: 'right' }}>
            View all →
          </div>
        </div>

        {/* Past Assignments — bottom right */}
        <div
          className="card"
          style={{ cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
          onClick={() => navigate('/teacher/reports')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(83,74,183,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <div className="row" style={{ gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--purple-light)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>
              📊
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Past Assignments</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {pastAssignments.filter(a => a.scoredCount > 0).length} completed assignment{pastAssignments.filter(a => a.scoredCount > 0).length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          {pastAssignments.slice(0, 2).map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: '0.5px solid var(--border)', fontSize: 12 }}>
              <div>
                <span style={{ fontWeight: 500 }}>{a.title}</span>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {a.scoredCount > 0 ? `Completed ${a.completedDate}` : 'No submissions yet'}
                </div>
              </div>
              {a.avgScore != null ? (
                <Badge variant={a.avgScore >= 80 ? 'teal' : a.avgScore >= 60 ? 'amber' : 'coral'}>Avg {a.avgScore}%</Badge>
              ) : (
                <Badge variant="gray">No data</Badge>
              )}
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 500, marginTop: 8, textAlign: 'right' }}>
            View all →
          </div>
        </div>

      </div>

    </div>
  );
}
