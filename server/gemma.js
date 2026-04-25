const GEMMA_API_URL = process.env.GEMMA_API_URL || 'http://localhost:11434';
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma2';

/**
 * Call the Ollama API with a prompt and return the parsed response.
 */
async function callGemma(prompt) {
  const res = await fetch(`${GEMMA_API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GEMMA_MODEL,
      prompt,
      stream: false,
      format: 'json',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemma API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const responseText = data.response || '';

  // Try to parse JSON from the response
  try {
    return JSON.parse(responseText);
  } catch {
    // Try to extract JSON from markdown code block
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    throw new Error('Failed to parse JSON from Gemma response');
  }
}

/**
 * Generate adapted lesson content for each student from worksheet text.
 */
async function adaptLesson(rawText, subject, students) {
  const results = {};

  for (const student of students) {
    const prompt = `You are an AI tutor adapting a worksheet for a special education student with autism.

Student profile:
- Name: ${student.name}
- Grade: ${student.grade}
- Learning styles: ${(student.learningStyles || []).join(', ')}
- Favorite characters: ${(student.characters || []).join(', ')}
- Sensory preferences: ${(student.sensoryPrefs || []).join(', ')}
- Frustration triggers: ${(student.frustrationTriggers || []).join(', ')}

Original worksheet content:
${rawText}

Subject: ${subject}

Generate a personalized lesson from this worksheet. Return valid JSON with this exact structure:
{
  "adaptedText": "The lesson content rewritten using the student's favorite characters and appropriate reading level",
  "formula": "The key formula or concept displayed prominently (if applicable, otherwise null)",
  "hint": "A helpful hint using the student's character theme",
  "cloudinaryPrompt": "A description for generating a themed illustration",
  "elevenLabsScript": "The text that should be read aloud for auditory learners",
  "questions": [
    {
      "id": "q1",
      "text": "Question text using character theme",
      "options": ["option A", "option B", "option C"],
      "correctIndex": 0,
      "hint": "A simpler hint if they get it wrong",
      "reframeExplanation": "A step-by-step breakdown if the student is really struggling"
    }
  ]
}

Rules:
- Use the student's favorite characters as examples in problems
- Break concepts into small, clear steps
- Use simple language appropriate for their grade level
- Avoid their frustration triggers (e.g., if "too many words" is a trigger, keep text minimal)
- Generate 3-5 questions based on the worksheet content
- Make it encouraging and warm in tone`;

    try {
      const adapted = await callGemma(prompt);
      results[student.id] = adapted;
    } catch (err) {
      console.error(`Failed to adapt for student ${student.id}:`, err.message);
      results[student.id] = { error: err.message };
    }
  }

  return results;
}

/**
 * Generate a reframed/simplified version of a question for a struggling student.
 */
async function generateReframe(question, studentProfile, wrongAttempts) {
  const prompt = `You are an AI tutor helping a special education student with autism who is struggling with a question.

Student profile:
- Name: ${studentProfile.name}
- Grade: ${studentProfile.grade}
- Favorite characters: ${(studentProfile.characters || []).join(', ')}
- Learning styles: ${(studentProfile.learningStyles || []).join(', ')}
- Frustration triggers: ${(studentProfile.frustrationTriggers || []).join(', ')}

The student has gotten this question wrong ${wrongAttempts} time(s):
Question: ${question.text}
Options: ${(question.options || []).join(', ')}
Correct answer index: ${question.correctIndex}

Create a simpler, step-by-step breakdown to help them understand. Return valid JSON:
{
  "steps": [
    { "label": "Step 1 — short label", "content": "Detailed step explanation using their favorite characters" }
  ],
  "simplifiedQuestion": {
    "text": "A much simpler version of the same question",
    "options": ["option A", "option B", "option C"],
    "correctIndex": 0
  },
  "encouragement": "A warm, personalized encouragement message using their favorite character"
}

Rules:
- Use ${(studentProfile.characters || ['their favorite character'])[0]} in the explanation
- Break it down into 2-3 simple steps maximum
- Use visual/concrete examples (like pizza slices, toys, etc.)
- Keep language simple and encouraging
- Avoid frustration triggers: ${(studentProfile.frustrationTriggers || []).join(', ')}`;

  return callGemma(prompt);
}

module.exports = { adaptLesson, generateReframe };
