import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignment, getStudent } from '../../lib/mockData';
import { useFrustration } from '../../lib/useFrustration';
import { FrustrationBar, SigRow, TlItem, Alert } from '../../components/UI';

const STUDENT = getStudent('jamie');
const MODES   = ['Visual', 'Listen', 'Read'];

export default function CuratedLesson() {
  const { assignmentId } = useParams();
  const navigate         = useNavigate();
  const assignment       = getAssignment(assignmentId);

  const [mode, setMode]         = useState('Visual');
  const [qIndex, setQIndex]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [adaptLog, setAdaptLog] = useState([
    { text: `${STUDENT.characters[0]} visual mode loaded per profile`, time: '9:02 AM', color: 'var(--teal)' },
  ]);

  const question = assignment.questions[qIndex];

  const onFrustrationTriggered = useCallback((score) => {
    // TODO: notify teacher via websocket/Supabase realtime
    console.log('Frustration threshold crossed:', score);
    navigate('/student/reframe');
  }, [navigate]);

  const frustration = useFrustration({ onFrustrationTriggered });

  const handleAnswer = (idx) => {
    frustration.recordClick();
    setSelected(idx);

    if (idx === question.correctIndex) {
      setFeedback({ correct: true, text: 'Correct! Great job! 🎉' });
      frustration.recordCorrectAnswer();
      setAdaptLog(prev => [
        { text: 'Correct answer — encouragement shown', time: 'Now', color: 'var(--teal)' },
        ...prev,
      ]);
    } else {
      frustration.recordWrongAnswer();
      const newScore = frustration.frustrationScore + 30;
      const hint = frustration.wrongAttempts >= 1;
      setFeedback({
        correct: false,
        text: hint
          ? `Hint: add just the top numbers — what is ${question.text.match(/\d/g)?.[0] || '?'} + ${question.text.match(/\d/g)?.[1] || '?'}?`
          : 'Not quite — try again!',
      });
      setAdaptLog(prev => [
        { text: `Wrong attempt ${frustration.wrongAttempts + 1} — ${hint ? 'hint shown' : 'encouraging message'}`, time: 'Now', color: 'var(--amber)' },
        ...prev,
      ]);
    }
  };

  const handleIdk = () => {
    frustration.recordIdkClick();
    setAdaptLog(prev => [
      { text: '"I don\'t understand" clicked — language simplified', time: 'Now', color: 'var(--amber)' },
      ...prev,
    ]);
  };

  const handleNext = () => {
    if (qIndex < assignment.questions.length - 1) {
      setQIndex(q => q + 1);
      setSelected(null);
      setFeedback(null);
      frustration.reset();
    } else {
      navigate('/student/complete');
    }
  };

  return (
    <div className="stack" style={{ gap: 12 }}>

      {/* Mode switcher + progress */}
      <div className="card-sm">
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {MODES.map(m => (
            <span
              key={m}
              className={`badge ${mode === m ? 'badge-purple' : 'badge-gray'}`}
              style={{ cursor: 'pointer', fontSize: 12, padding: '4px 12px' }}
              onClick={() => setMode(m)}
            >
              {m}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            {qIndex + 1} of {assignment.questions.length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="row" style={{ gap: 6 }}>
          {assignment.questions.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < qIndex ? 'var(--teal)' : i === qIndex ? 'var(--purple)' : 'var(--border-md)',
            }} />
          ))}
        </div>
      </div>

      {/* Lesson card */}
      <div className="card">
        <div className="char-bubble">{STUDENT.characters[0]} says: Let's do this! ⭐</div>

        {/* TODO: replace with real Cloudinary image */}
        {mode === 'Visual' && (
          <div style={{
            background: 'var(--purple-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--purple-dark)',
            marginBottom: 12,
          }}>
            📷 Cloudinary themed image — {STUDENT.characters[0]} illustration here
          </div>
        )}

        {/* TODO: replace with real ElevenLabs audio player */}
        {mode === 'Listen' && (
          <div style={{
            background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--blue-dark)',
            marginBottom: 12,
          }}>
            🔊 ElevenLabs — narrating question now...
          </div>
        )}

        {/* Question text */}
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>
          {question?.text}
        </div>

        {/* Formula display */}
        {assignment.adaptedVersions?.jamie?.formula && (
          <div style={{
            background: 'var(--purple-light)', borderRadius: 8, padding: 12,
            textAlign: 'center', fontSize: 20, fontWeight: 500,
            color: 'var(--purple-dark)', marginBottom: 14,
          }}>
            {assignment.adaptedVersions.jamie.formula}
          </div>
        )}

        {/* Answer options */}
        {question?.options.map((opt, idx) => (
          <div
            key={idx}
            className={`ans-opt${selected === idx ? (idx === question.correctIndex ? ' correct' : ' wrong') : ''}`}
            onClick={() => selected === null && handleAnswer(idx)}
            style={{ cursor: selected !== null ? 'default' : 'pointer' }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {String.fromCharCode(65 + idx)}.
            </span>
            <span style={{ fontSize: 15 }}>{opt}</span>
          </div>
        ))}

        {/* Feedback */}
        {feedback && (
          <div style={{
            marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13,
            background: feedback.correct ? 'var(--teal-light)' : 'var(--coral-light)',
            color:      feedback.correct ? 'var(--teal-dark)'  : 'var(--coral-dark)',
          }}>
            {feedback.text}
          </div>
        )}

        {/* Action buttons */}
        <div className="row-between" style={{ marginTop: 14 }}>
          <button className="btn btn-danger btn-sm" onClick={handleIdk}>
            I don't understand
          </button>
          {feedback?.correct && (
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              {qIndex < assignment.questions.length - 1 ? 'Next question →' : 'Finish!'}
            </button>
          )}
        </div>
      </div>

      {/* Live signal sidebar — hidden from student, shown for demo/teacher context */}
      <details style={{ fontSize: 12 }}>
        <summary style={{ color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 6 }}>
          Live signals (teacher view)
        </summary>
        <div className="card-sm">
          <SigRow label="Rapid clicks"              value={`${frustration.rapidClickCount} recent`} valueColor={frustration.rapidClickCount >= 3 ? 'var(--amber-dark)' : undefined} />
          <SigRow label="Wrong attempts"            value={`${frustration.wrongAttempts}`}          valueColor={frustration.wrongAttempts >= 2 ? 'var(--coral)' : undefined} />
          <SigRow label='"I don\'t understand"'     value={`${frustration.idkClicks}×`}             valueColor={frustration.idkClicks >= 2 ? 'var(--amber-dark)' : undefined} />
          <SigRow label="Flagged phrases"           value={`${frustration.flaggedPhrases.length}`} />
          <div style={{ marginTop: 10 }}>
            <FrustrationBar score={frustration.frustrationScore} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="card-title">Adaptation log</div>
            {adaptLog.slice(0, 4).map((ev, i) => (
              <TlItem key={i} text={ev.text} time={ev.time} color={ev.color} />
            ))}
          </div>
        </div>
      </details>

    </div>
  );
}
