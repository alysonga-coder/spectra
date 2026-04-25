import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignment, getStudent } from '../../lib/mockData';
import { useFrustration } from '../../lib/useFrustration';
import { FrustrationBar, SigRow, TlItem, Alert } from '../../components/UI';
import { useLessonContext } from '../../lib/LessonContext';

const STUDENT = getStudent('jamie');
const MODES   = ['Visual', 'Listen', 'Read'];

export default function CuratedLesson() {
  const { assignmentId } = useParams();
  const navigate         = useNavigate();
  const assignment       = getAssignment(assignmentId);
  const { getAdaptedVersion } = useLessonContext();

  // Load Gemma-generated content from LessonContext or localStorage
  const contextVersion = getAdaptedVersion(assignmentId, STUDENT.id);
  const [gemmaLesson, setGemmaLesson] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('spectra_adapted_lesson');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const studentLesson = parsed[STUDENT?.id || 'jamie'];
        if (studentLesson) setGemmaLesson(studentLesson);
      } catch (e) {
        console.error('Failed to parse stored lesson:', e);
      }
    }
  }, []);

  const adaptedVersion = contextVersion || gemmaLesson;
  const questions = adaptedVersion?.questions?.length
    ? adaptedVersion.questions
    : assignment.questions;

  const [mode, setMode]         = useState('Visual');
  const [qIndex, setQIndex]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [adaptLog, setAdaptLog] = useState([
    { text: `${STUDENT.characters[0]} visual mode loaded per profile`, time: '9:02 AM', color: 'var(--teal)' },
  ]);

  const question = questions[qIndex];

  const onFrustrationTriggered = useCallback((score) => {
    console.log('Frustration threshold crossed:', score);
    navigate('/student/reframe', {
      state: {
        question,
        studentProfile: STUDENT,
        wrongAttempts: frustration.wrongAttempts,
        assignmentId,
        qIndex,
        studentId: STUDENT.id,
      },
    });
  }, [navigate, question, assignmentId, qIndex, frustration.wrongAttempts]);

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
      const wrongCount = frustration.wrongAttempts + 1;

      // Use Gemma-generated hint if available
      const gemmaHint = question?.hint;
      const defaultHint = `Hint: add just the top numbers — what is ${question.text.match(/\d/g)?.[0] || '?'} + ${question.text.match(/\d/g)?.[1] || '?'}?`;
      const showHint = wrongCount >= 2;

      let feedbackText = 'Not quite — try again!';
      if (showHint) {
        feedbackText = gemmaHint || defaultHint;
      }

      setFeedback({ correct: false, text: feedbackText });
      setAdaptLog(prev => [
        { text: `Wrong attempt ${wrongCount} — ${showHint ? 'hint shown' : 'encouraging message'}`, time: 'Now', color: 'var(--amber)' },
        ...prev,
      ]);

      // After 3+ wrong attempts, navigate to reframe
      if (wrongCount >= 3) {
        setTimeout(() => {
          navigate('/student/reframe', {
            state: {
              question,
              studentProfile: STUDENT,
              wrongAttempts: wrongCount,
              assignmentId,
              qIndex,
              studentId: STUDENT.id,
            },
          });
        }, 1500);
      }
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
    if (qIndex < questions.length - 1) {
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
            {qIndex + 1} of {questions.length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="row" style={{ gap: 6 }}>
          {questions.map((_, i) => (
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

        {/* Adapted text from Gemma */}
        {adaptedVersion?.adaptedText && (
          <p style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.7 }}>
            {adaptedVersion.adaptedText}
          </p>
        )}

        {/* Cloudinary image placeholder */}
        {mode === 'Visual' && (
          <div style={{
            background: 'var(--purple-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--purple-dark)',
            marginBottom: 12,
          }}>
            📷 Cloudinary themed image — {STUDENT.characters[0]} illustration here
          </div>
        )}

        {/* ElevenLabs audio placeholder */}
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
        {(adaptedVersion?.formula || assignment.adaptedVersions?.jamie?.formula) && (
          <div style={{
            background: 'var(--purple-light)', borderRadius: 8, padding: 12,
            textAlign: 'center', fontSize: 20, fontWeight: 500,
            color: 'var(--purple-dark)', marginBottom: 14,
          }}>
            {adaptedVersion?.formula || assignment.adaptedVersions.jamie.formula}
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
              {qIndex < questions.length - 1 ? 'Next question →' : 'Finish!'}
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
          <SigRow label='"I don&apos;t understand"' value={`${frustration.idkClicks}×`}             valueColor={frustration.idkClicks >= 2 ? 'var(--amber-dark)' : undefined} />
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
