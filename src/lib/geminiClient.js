import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromFile(file) {
  const base64Data = await fileToBase64(file);
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    },
    'Extract all the text content from this document. Include all questions, instructions, and any mathematical expressions. Return only the extracted text, nothing else.',
  ]);
  return result.response.text();
}

export async function adaptLesson(rawContent, subject, students) {
  const adaptedVersions = {};

  for (const student of students) {
    try {
      const prompt = `You are adapting a lesson for a student with autism.

Student profile:
- Name: ${student.name}
- Grade: ${student.grade}
- Learning styles: ${student.learningStyles.join(', ')}
- Favorite characters: ${student.characters.join(', ')}
- Frustration triggers: ${student.frustrationTriggers.join(', ')}

Subject: ${subject}

Original worksheet content:
${rawContent}

Rewrite this lesson using the student's favorite characters. Keep the language appropriate for ${student.grade} level. Avoid frustration triggers (${student.frustrationTriggers.join(', ')}). Be encouraging and warm in tone. Generate 3-5 quiz questions using the character theme.

Return ONLY valid JSON with this exact structure (no markdown code fences):
{
  "adaptedText": "lesson content rewritten using student's characters",
  "formula": "key formula or null",
  "hint": "helpful hint using character theme",
  "cloudinaryPrompt": "description for themed illustration",
  "elevenLabsScript": "text to read aloud for auditory learners",
  "questions": [
    {
      "id": "q1",
      "text": "question using character theme",
      "options": ["A", "B", "C"],
      "correctIndex": 0,
      "hint": "simpler hint if wrong",
      "reframeExplanation": "step-by-step breakdown if struggling"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      adaptedVersions[student.id] = JSON.parse(text);
    } catch (err) {
      console.error(`Failed to adapt lesson for ${student.id}:`, err);
      adaptedVersions[student.id] = null;
    }
  }

  return adaptedVersions;
}

export async function generateReframe(question, studentProfile, wrongAttempts) {
  const prompt = `A student with autism is struggling with a question after ${wrongAttempts} wrong attempts. Create a gentle, step-by-step reframe to help them understand.

Student profile:
- Name: ${studentProfile.name}
- Grade: ${studentProfile.grade}
- Favorite characters: ${studentProfile.characters.join(', ')}
- Learning styles: ${studentProfile.learningStyles.join(', ')}
- Frustration triggers: ${studentProfile.frustrationTriggers.join(', ')}

The question they're stuck on:
${question.text}
Options: ${question.options.join(', ')}
Correct answer index: ${question.correctIndex}

Create a warm, encouraging breakdown using their favorite character (${studentProfile.characters[0]}). Break the problem into tiny steps. Avoid their frustration triggers.

Return ONLY valid JSON (no markdown code fences):
{
  "steps": [
    { "label": "Step 1 — description", "content": "simple explanation" }
  ],
  "simplifiedQuestion": {
    "text": "simplified version of the question",
    "options": ["option A", "option B", "option C"],
    "correctIndex": 0
  },
  "encouragement": "warm encouraging message using their character"
}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(text);
}
