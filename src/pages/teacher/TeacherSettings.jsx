import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEACHER, STUDENTS } from '../../lib/mockData';
import { Avatar } from '../../components/UI';

export default function TeacherSettings() {
  const navigate = useNavigate();

  // Password form state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Student list (local state for add/remove)
  const [students, setStudents] = useState(STUDENTS);

  // Add student form state
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');

  // Class code
  const classCode = TEACHER.room ? TEACHER.room.replace('Room ', 'SV-') : 'SV-4B';

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      alert('Please fill in all password fields.');
      return;
    }
    if (newPw !== confirmPw) {
      alert('New passwords do not match.');
      return;
    }
    alert('Password updated (demo only — wire up Firebase updatePassword later).');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  }

  function handleRemoveStudent(student) {
    if (window.confirm(`Remove ${student.name} from your class?`)) {
      setStudents(prev => prev.filter(s => s.id !== student.id));
    }
  }

  function handleAddStudent(e) {
    e.preventDefault();
    if (!newName.trim() || !newGrade.trim()) return;
    const initials = newName.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const id = newName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    setStudents(prev => [
      ...prev,
      {
        id,
        name: newName.trim(),
        initials,
        grade: newGrade.trim(),
        avatarColor: { bg: '#E1F5EE', text: '#085041' },
        learningStyles: [],
        characters: [],
        engagementPct: 0,
        frustrationLevel: 'low',
        frustrationScore: 0,
        status: 'offline',
        sessionActive: false,
        frustrationHistory: [],
        currentAssignment: null,
      },
    ]);
    setNewName('');
    setNewGrade('');
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(classCode).then(
      () => alert('Class code copied!'),
      () => alert('Failed to copy — please copy manually: ' + classCode),
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Manage your account, class, and students</div>
        </div>
      </div>

      <div style={{ maxWidth: 600 }}>

        {/* ── Account card ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Account</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            {TEACHER.email}
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <label className="label">Current password</label>
            <input
              className="input"
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              style={{ marginBottom: 8 }}
            />

            <label className="label">New password</label>
            <input
              className="input"
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              style={{ marginBottom: 8 }}
            />

            <label className="label">Confirm new password</label>
            <input
              className="input"
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <button type="submit" className="btn btn-primary">Update password</button>
          </form>
        </div>

        {/* ── Class Code card ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Class code</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>{classCode}</span>
            <button className="btn btn-primary" onClick={handleCopyCode} style={{ fontSize: 12, padding: '4px 10px' }}>
              Copy
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Share this code with students so they can join your class
          </div>
        </div>

        {/* ── Manage Students card ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Students in your class</div>

          {students.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              No students yet.
            </div>
          )}

          {students.map(s => (
            <div
              key={s.id}
              className="row-between"
              style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}
            >
              <div className="row" style={{ gap: 10 }}>
                <Avatar
                  initials={s.initials}
                  bg={s.avatarColor.bg}
                  color={s.avatarColor.text}
                  size={32}
                />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.grade}</div>
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ fontSize: 12, padding: '4px 10px' }}
                onClick={() => handleRemoveStudent(s)}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add student form */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>Add a student</div>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                className="input"
                placeholder="Student name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ flex: 1, minWidth: 140 }}
              />
              <input
                className="input"
                placeholder="Grade"
                value={newGrade}
                onChange={e => setNewGrade(e.target.value)}
                style={{ width: 100 }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>
                Add student
              </button>
            </form>
          </div>
        </div>

        {/* ── Log Out card ── */}
        <div className="card">
          <button className="btn btn-danger btn-full" onClick={() => navigate('/')}>
            Log out
          </button>
        </div>

      </div>
    </div>
  );
}
