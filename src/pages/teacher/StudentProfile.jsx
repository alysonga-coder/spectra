import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Badge, ProgressBar, TlItem } from '../../components/UI';
import { STUDENTS } from '../../lib/mockData';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_STUDENT = {
  id: '',
  firestoreStudent: true,
  name: 'Student',
  initials: 'ST',
  grade: '',
  avatarColor: { bg: '#E6F1FB', text: '#042C53' },
  learningStyles: [],
  allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
  characters: [],
  allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
  sensoryPrefs: [],
  frustrationTriggers: [],
  engagementPct: 0,
  frustrationLevel: 'low',
  frustrationScore: 0,
  status: 'offline',
  sessionActive: false,
  frustrationHistory: [0, 0, 0, 0, 0, 0, 0],
  currentAssignment: null,
};

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate      = useNavigate();

  const [firestoreData, setFirestoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is a mock student first
    const mockStudent = STUDENTS.find(s => s.id === studentId);
    if (mockStudent) {
      setFirestoreData(mockStudent);
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'users', studentId));
        if (snap.exists()) {
          const d = snap.data();
          const name = d.name || 'Student';
          setFirestoreData({
            id: studentId,
            firestoreStudent: true,
            name,
            initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            grade: d.grade || '',
            avatarColor: { bg: '#E6F1FB', text: '#042C53' },
            learningStyles: d.learningStyles || [],
            allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
            characters: d.characters || [],
            allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
            sensoryPrefs: d.sensoryPrefs || [],
            frustrationTriggers: d.frustrationTriggers || [],
            engagementPct: 0,
            frustrationLevel: 'low',
            frustrationScore: 0,
            status: 'offline',
            sessionActive: false,
            frustrationHistory: [0, 0, 0, 0, 0, 0, 0],
            currentAssignment: null,
          });
        }
      } catch (e) {
        console.error('Failed to load student:', e);
      }
      setLoading(false);
    }
    load();
  }, [studentId]);

  const student = firestoreData || DEFAULT_STUDENT;

  const [selectedStyles,   setSelectedStyles]   = useState(student.learningStyles);
  const [selectedChars,    setSelectedChars]    = useState(student.characters);
  const [selectedSensory,  setSelectedSensory]  = useState(student.sensoryPrefs);
  const [selectedTriggers, setSelectedTriggers] = useState(student.frustrationTriggers);
  const [editing,          setEditing]          = useState(true);
  const [saved,            setSaved]            = useState(false);

  useEffect(() => {
    if (firestoreData) {
      setSelectedStyles(firestoreData.learningStyles);
      setSelectedChars(firestoreData.characters);
      setSelectedSensory(firestoreData.sensoryPrefs);
      setSelectedTriggers(firestoreData.frustrationTriggers);
    }
  }, [firestoreData]);

  const toggle = (setter, value) => setter(prev =>
    prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]
  );

  const [saveError, setSaveError] = useState(false);

  const handleSave = async () => {
    setSaveError(false);
    if (student.firestoreStudent && firestoreData) {
      try {
        await updateDoc(doc(db, 'users', studentId), {
          learningStyles: selectedStyles,
          characters: selectedChars,
          sensoryPrefs: selectedSensory,
          frustrationTriggers: selectedTriggers,
        });
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        console.error('Failed to save student profile:', e);
        setSaveError(true);
        setTimeout(() => setSaveError(false), 3000);
      }
    }
  };

  const frustrationVariant = idx => {
    const v = student.frustrationHistory[idx];
    if (v >= 70) return 'coral';
    if (v >= 35) return 'amber';
    return 'teal';
  };

  return (
    <div className="page">

      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/dashboard')}>
          ← Back
        </button>
        <button
          className={`btn btn-sm ${editing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => editing ? handleSave() : setEditing(true)}
        >
          {editing ? 'Save profile' : 'Edit profile'}
        </button>
      </div>

      {saved && (
        <div className="alert alert-info">Profile saved successfully.</div>
      )}
      {saveError && (
        <div className="alert" style={{ background: 'var(--coral-light)', color: 'var(--coral-dark)', border: '1px solid var(--coral)' }}>Failed to save profile. Please try again.</div>
      )}

      <div className="grid-2" style={{ gap: 16, alignItems: 'start' }}>

        {/* Profile card */}
        <div className="card">
          <div className="row" style={{ gap: 12, marginBottom: 20 }}>
            <Avatar initials={student.initials} bg={student.avatarColor.bg} color={student.avatarColor.text} size={48} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{student.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{student.grade}</div>
            </div>
          </div>

          {/* Learning style */}
          <div style={{ marginBottom: 16 }}>
            <div className="label">Learning style</div>
            <div className="tag-row">
              {student.allStyles.map(s => (
                <div
                  key={s}
                  className={`tag${selectedStyles.includes(s) ? ' selected' : ''}`}
                  onClick={() => editing && toggle(setSelectedStyles, s)}
                  style={{ cursor: editing ? 'pointer' : 'default' }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Favorite characters */}
          <div style={{ marginBottom: 16 }}>
            <div className="label">Favorite characters / shows</div>
            <div className="tag-row">
              {student.allCharacters.map(c => (
                <div
                  key={c}
                  className={`tag${selectedChars.includes(c) ? ' selected' : ''}`}
                  onClick={() => editing && toggle(setSelectedChars, c)}
                  style={{ cursor: editing ? 'pointer' : 'default' }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Sensory prefs */}
          <div style={{ marginBottom: 16 }}>
            <div className="label">Sensory preferences</div>
            <div className="tag-row">
              {['Avoids loud sounds', 'Sensitive to bright colors', 'Prefers minimal text', 'Needs visual anchors', 'High contrast'].map(p => (
                <div
                  key={p}
                  className={`tag${selectedSensory.includes(p) ? ' selected' : ''}`}
                  onClick={() => editing && toggle(setSelectedSensory, p)}
                  style={{ cursor: editing ? 'pointer' : 'default' }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Frustration triggers */}
          <div>
            <div className="label">Frustration triggers</div>
            <div className="tag-row">
              {['Too many words', 'Time pressure', 'Multiple steps', 'Ambiguous instructions'].map(t => (
                <div
                  key={t}
                  className={`tag${selectedTriggers.includes(t) ? ' selected' : ''}`}
                  onClick={() => editing && toggle(setSelectedTriggers, t)}
                  style={{ cursor: editing ? 'pointer' : 'default' }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="stack" style={{ gap: 12 }}>

          {/* Frustration history */}
          <div className="card">
            <div className="card-title">Frustration history — last 7 days</div>
            <div className="stack" style={{ gap: 8 }}>
              {DAYS.map((day, i) => (
                <div key={day} className="row-between" style={{ fontSize: 12 }}>
                  <span style={{ width: 28, color: 'var(--text-muted)' }}>{day}</span>
                  <div style={{ flex: 1, margin: '0 10px' }}>
                    <ProgressBar pct={student.frustrationHistory[i]} variant={frustrationVariant(i)} />
                  </div>
                  <span style={{ width: 30, textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>
                    {student.frustrationHistory[i]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current adapted assignment */}
          <div className="card">
            <div className="card-title">Current assignment adaptation</div>
            <div style={{
              background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
              padding: '10px 12px', fontSize: 12, lineHeight: 1.6,
            }}>
              <div className="char-bubble" style={{ fontSize: 11, marginBottom: 8 }}>
                {selectedChars[0] || 'Character'} theme active
              </div>
              <p>
                Fractions — {selectedStyles[0]?.toLowerCase() || 'visual'} mode.
                Simplified to 1 concept per screen.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm">Preview adapted lesson</button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card">
            <div className="card-title">Quick stats</div>
            <TlItem text={`Engagement this session: ${student.engagementPct}%`}    color="var(--teal)" />
            <TlItem text={`Frustration score: ${student.frustrationScore}`}         color={student.frustrationLevel === 'high' ? 'var(--coral)' : 'var(--amber)'} />
            <TlItem text={`Preferred style: ${selectedStyles.join(', ')}`}          color="var(--purple)" />
          </div>

        </div>
      </div>
    </div>
  );
}
