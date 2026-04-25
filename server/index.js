const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseFile } = require('./parseFile');
const { adaptLesson, generateReframe } = require('./gemma');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Multer config for file uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ─── POST /api/adapt-lesson ────────────────────────────────────────────
app.post('/api/adapt-lesson', upload.single('file'), async (req, res) => {
  let extractedText = '';
  const uploadedFile = req.file;

  try {
    // 1. Parse uploaded file if present
    if (uploadedFile) {
      const parsed = await parseFile(uploadedFile.path, uploadedFile.mimetype);
      extractedText = parsed.text || '';
    }

    // 2. Combine with raw text content from the form
    const rawContent = req.body.rawContent || '';
    const combinedText = [extractedText, rawContent].filter(Boolean).join('\n\n');

    if (!combinedText.trim()) {
      return res.status(400).json({ error: 'No content provided — upload a file or paste lesson text.' });
    }

    const subject = req.body.subject || 'General';
    let students = [];
    try {
      students = JSON.parse(req.body.students || '[]');
    } catch {
      return res.status(400).json({ error: 'Invalid students JSON.' });
    }

    if (students.length === 0) {
      return res.status(400).json({ error: 'At least one student profile is required.' });
    }

    // 3. Call Gemma to adapt the lesson
    const adapted = await adaptLesson(combinedText, subject, students);

    return res.json(adapted);
  } catch (err) {
    console.error('adapt-lesson error:', err);
    return res.status(500).json({ error: 'Failed to adapt lesson. Is the Gemma/Ollama server running?' });
  } finally {
    // 4. Clean up uploaded file
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
  }
});

// ─── POST /api/reframe ─────────────────────────────────────────────────
app.post('/api/reframe', async (req, res) => {
  try {
    const { question, studentProfile, wrongAttempts } = req.body;

    if (!question || !studentProfile) {
      return res.status(400).json({ error: 'question and studentProfile are required.' });
    }

    const reframed = await generateReframe(question, studentProfile, wrongAttempts || 1);
    return res.json(reframed);
  } catch (err) {
    console.error('reframe error:', err);
    return res.status(500).json({ error: 'Failed to generate reframe. Is the Gemma/Ollama server running?' });
  }
});

// ─── Health check ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Spectra API server running on http://localhost:${PORT}`);
});
