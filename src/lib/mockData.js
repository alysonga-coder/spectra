// ============================================================
//  mockData.js
//  Central source of truth for all prototype/demo data.
//  Replace these with real API calls / Gemma responses later.
// ============================================================

export const STUDENTS = [
  {
    id: 'jamie',
    name: 'Jamie L.',
    initials: 'JL',
    grade: 'Grade 3',
    avatarColor: { bg: '#E1F5EE', text: '#085041' },
    learningStyles: ['Visual'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Bluey', 'Bingo'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['Avoids loud sounds', 'Minimal text'],
    frustrationTriggers: ['Too many words', 'Time pressure'],
    engagementPct: 78,
    frustrationLevel: 'low',   // low | moderate | high
    frustrationScore: 20,
    status: 'calm',            // calm | alert | stress | offline
    sessionActive: true,
    frustrationHistory: [20, 45, 70, 30, 48, 22, 35], // Mon–Sun
    currentAssignment: 'fractions',
  },
  {
    id: 'maya',
    name: 'Maya K.',
    initials: 'MK',
    grade: 'Grade 3',
    avatarColor: { bg: '#FAEEDA', text: '#633806' },
    learningStyles: ['Auditory'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Paw Patrol'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['High contrast'],
    frustrationTriggers: ['Ambiguous instructions'],
    engagementPct: 55,
    frustrationLevel: 'moderate',
    frustrationScore: 48,
    status: 'alert',
    sessionActive: true,
    frustrationHistory: [30, 40, 50, 55, 60, 48, 52],
    currentAssignment: 'fractions',
  },
  {
    id: 'eli',
    name: 'Eli R.',
    initials: 'ER',
    grade: 'Grade 3',
    avatarColor: { bg: '#FAECE7', text: '#4A1B0C' },
    learningStyles: ['Tactile', 'Visual'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Minecraft Steve'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['Prefers minimal text'],
    frustrationTriggers: ['Multiple steps', 'Time pressure'],
    engagementPct: 32,
    frustrationLevel: 'high',
    frustrationScore: 82,
    status: 'stress',
    sessionActive: true,
    frustrationHistory: [60, 70, 80, 90, 75, 82, 85],
    currentAssignment: 'fractions',
  },
  {
    id: 'sofia',
    name: 'Sofia B.',
    initials: 'SB',
    grade: 'Grade 3',
    avatarColor: { bg: '#EEEDFE', text: '#26215C' },
    learningStyles: ['Reading', 'Visual'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Mirabel (Encanto)'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['High contrast', 'Needs visual anchors'],
    frustrationTriggers: ['Ambiguous instructions'],
    engagementPct: 90,
    frustrationLevel: 'low',
    frustrationScore: 12,
    status: 'offline',
    sessionActive: false,
    frustrationHistory: [15, 10, 20, 8, 12, 10, 5],
    currentAssignment: null,
  },
];

export const ASSIGNMENTS = [
  {
    id: 'fractions',
    subject: 'Math',
    title: 'Fractions — adding with like denominators',
    dueDate: 'Apr 26, 2026',
    status: 'new', // new | in-progress | done
    rawContent: `Solve the following fraction problems. Show your work for each step. 
Use pictures or diagrams if it helps you think. 
Remember: when the bottom numbers are the same, just add the top numbers!`,
    adaptedVersions: {
      jamie: {
        character: 'Bluey',
        mode: 'visual',
        content: `Bluey and Bingo are sharing a pizza with 8 slices (that's the bottom number!). 
Bluey takes 3 slices. Bingo takes 2 slices. How many slices do they have together?`,
        formula: '³⁄₈ + ²⁄₈ = ?',
        hint: 'Just add the top numbers! 3 + 2 = 5, so the answer is ⁵⁄₈.',
        cloudinaryImage: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', // replace with real Cloudinary URL
        elevenLabsAudio: null, // replace with ElevenLabs audio URL
      },
    },
    questions: [
      {
        id: 'q1',
        text: 'What is ³⁄₈ + ²⁄₈?',
        options: ['⁴⁄₈', '⁵⁄₈', '⁶⁄₈'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        text: 'What is ²⁄₆ + ³⁄₆?',
        options: ['⁴⁄₆', '⁵⁄₆', '⁶⁄₆'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        text: 'What is ¹⁄₄ + ²⁄₄?',
        options: ['²⁄₄', '³⁄₄', '⁴⁄₄'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'sightwords',
    subject: 'Reading',
    title: 'Sight words — set 4',
    dueDate: 'Apr 20, 2026',
    status: 'done',
    rawContent: 'Practice reading and writing this week\'s sight words.',
    questions: [],
  },
  {
    id: 'community',
    subject: 'Social Skills',
    title: 'My community helpers',
    dueDate: 'Apr 28, 2026',
    status: 'new',
    rawContent: 'Learn about people who help us in our community.',
    questions: [],
  },
];

// Frustration signal thresholds — used by the detection engine
export const FRUSTRATION_CONFIG = {
  rapidClickWindow:     8,    // seconds
  rapidClickThreshold:  3,    // clicks within window
  wrongAttemptsThreshold: 3,  // consecutive wrong answers
  idkButtonThreshold:   2,    // "I don't understand" presses
  frustrationScoreThreshold: 70, // 0–100 score that triggers auto-reframe
  keywordsToFlag: [
    "i don't get it", "i dont get it", "i don't understand",
    "this is too hard", "i hate this", "i can't do this",
    "too hard", "i give up", "this is stupid",
  ],
};

// Reframe event log (simulated)
export const REFRAME_EVENTS = [
  {
    studentId: 'eli',
    timestamp: '9:14 AM',
    trigger: 'High frustration',
    before: 'Text mode — standard fractions lesson',
    after: 'Minecraft visual mode — ElevenLabs narration enabled',
    color: '#D85A30',
  },
  {
    studentId: 'maya',
    timestamp: '9:08 AM',
    trigger: 'Moderate signals',
    before: 'Visual mode — Paw Patrol theme',
    after: 'Added ElevenLabs audio narration layer',
    color: '#EF9F27',
  },
  {
    studentId: 'jamie',
    timestamp: '9:02 AM',
    trigger: 'Profile-based load',
    before: '—',
    after: 'Visual mode + Bluey theme loaded per profile',
    color: '#1D9E75',
  },
];

// Teacher info (static for now)
export const TEACHER = {
  name: 'Ms. Rivera',
  room: 'Room 4B',
  school: 'Sunview Elementary',
  email: 'mrivera@sunviewschool.edu',
};

// ---- Helpers ----

export function getStudent(id) {
  return STUDENTS.find(s => s.id === id) || STUDENTS[0];
}

export function getAssignment(id) {
  return ASSIGNMENTS.find(a => a.id === id) || ASSIGNMENTS[0];
}

export function frustrationColor(level) {
  if (level === 'high')     return 'var(--coral)';
  if (level === 'moderate') return 'var(--amber)';
  return 'var(--teal)';
}

export function statusBadgeClass(status) {
  if (status === 'stress')  return 'badge-coral';
  if (status === 'alert')   return 'badge-amber';
  if (status === 'offline') return 'badge-gray';
  return 'badge-teal';
}

export function statusLabel(status) {
  if (status === 'stress')  return 'Struggling';
  if (status === 'alert')   return 'Alert';
  if (status === 'offline') return 'Offline';
  return 'Calm';
}
