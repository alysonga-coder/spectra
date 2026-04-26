import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDENTS, statusBadgeClass, statusLabel } from '../../lib/mockData';
import { StatCard, Alert, Avatar, StatusDot, Badge, ProgressBar } from '../../components/UI';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const highFrustration = STUDENTS.filter(s => s.status === 'stress');

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
          <div className="page-title">Room 4B — Ms. Rivera</div>
          <div className="page-sub">
            {STUDENTS.filter(s => s.sessionActive).length} active sessions · {STUDENTS.length} students total
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/upload')}>
          + Upload lesson
        </button>
      </div>

      {/* Stats row */}
      <div className="grid-4">
        <StatCard label="Students"       value={STUDENTS.length} />
        <StatCard label="Lessons today"  value={3} sub="1 auto-adapted" />
        <StatCard label="Avg engagement" value="74%" valueColor="var(--purple)" />
        <StatCard label="AI reframes"    value={9}  valueColor="var(--coral)" sub="today" />
      </div>

      {/* Student grid */}
      <div>
        <div className="card-title" style={{ marginBottom: 10 }}>Students</div>
        <div className="grid-2">
          {STUDENTS.map(student => (
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
      </div>

    </div>
  );
}
