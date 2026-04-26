# Testing Spectra Teacher Views

This skill covers end-to-end testing of the teacher-facing pages: Dashboard, Assignments, Reports, and Student Profile.

## Prerequisites

- Node.js installed (project uses React via Create React App)
- Run `npm install` in the repo root
- Firebase config in `src/lib/firebase.js` must have valid values (not placeholders). If the app shows `auth/api-key-not-valid` errors, the config needs to be updated.

## Starting the Dev Server

```bash
cd /home/ubuntu/repos/spectra
npm run start:client
```

This starts the React dev server on **port 3000**. The app is available at `http://localhost:3000`.

## Auth Bypass for Testing

The app uses Firebase auth with a `RequireTeacher` guard in `src/App.js`. To bypass for testing:

1. In `src/App.js`, find the `RequireTeacher` function
2. Add `return children;` as the first line of the function body
3. **Always revert this change after testing** — do not commit it

Alternatively, if Firebase config is valid, you can create a real test account via `/teacher/signup` and log in normally. This is preferred when testing auth-related changes.

## Teacher Routes

- `/teacher/dashboard` — Dashboard with student cards, stat cards, current/past assignments
- `/teacher/upload` — Assignment creation + lesson preview + published assignments tracking
- `/teacher/reports` — Reports with sidebar + tabbed detail views (Overview, Per Student, Questions, Insights)
- `/teacher/settings` — Settings page
- `/teacher/profile/:studentId` — Individual student profile with learning preferences, frustration history, and adaptation info

## Mock Data Structure

All data is in `src/lib/mockData.js`:
- `STUDENTS` — 4 students: jamie (Visual), maya (Auditory), eli (Kinesthetic), sofia (Reading)
- `PUBLISHED_ASSIGNMENTS` — Active assignments with per-student tracking
- `PAST_ASSIGNMENTS` — Completed assignments with scores
- `REPORT_ASSIGNMENTS` — 8 assignments across 4 subjects with detailed stats
- `REPORT_SUBJECT_META` — Subject icons and colors
- Each assignment has: overview stats, student results, reframe log, questions, insights

## Key Test Flows

### Dashboard (`/teacher/dashboard`)
- Verify stat cards: Students count, Lessons today, Avg engagement, AI reframes
- Verify student grid shows all mock students with correct learning style badges
- Verify frustration alert banner (Eli has high frustration)
- Verify current/past assignment lists with correct student counts

### Upload Page (`/teacher/upload`)
- The preview panel header should show a student name (e.g., "Preview — Jamie L.") — if it shows just "Preview — Student" or is blank, the `previewStudent` state might not be initialized
- "Assign to" dropdown should show "All students (N)" matching the STUDENTS array length
- Published Assignments section lists per-student progress with learning style + theme badges
- If Cloudinary/ElevenLabs integration is not yet active, there should be no placeholder boxes in the preview panel

### Student Profile (`/teacher/profile/:studentId`)
- Learning style tags, character tags, sensory preferences, and frustration triggers are toggleable
- Clicking "Save profile" should provide feedback (button changes to "Edit profile", success toast appears)
- For mock students, save is local-only (no Firestore write). If save silently does nothing, check the `handleSave` function's guard for `student.firestoreStudent`
- Frustration history chart shows 7 bars (Mon–Sun)
- "Current assignment adaptation" section should show themed content without Cloudinary/ElevenLabs mentions (unless those integrations are active)

### Reports Page (`/teacher/reports`)
- Sidebar has 4 subject groups: Mathematics, Reading, Science, Social Skills (collapsible)
- Each group is collapsible (click header to toggle)
- Assignments have color-coded dots (coral = flagged, amber = warning, teal = good)
- Tabs per assignment: Overview, Per Student, Questions, Insights
- Per Student tab should show exactly the number of students in STUDENTS array
- Bold text in insight cards renders correctly without XSS (uses `escapeHtml` + `renderBoldMarkdown`)

## Common Issues

- If the page shows a blank screen or redirect, check the browser console for errors. Common causes: Firebase config has placeholder values, or auth bypass not applied.
- The dev server may take 10-20 seconds for initial compilation. Wait for the "Compiled successfully" message in the terminal.
- Port 3000 might already be in use from a previous session. Check with `lsof -i :3000` and kill any existing processes.
- Proxy errors for `/favicon.ico` to `localhost:3001` are expected if the Express backend is not running — this is harmless for frontend-only testing.

## Devin Secrets Needed

No secrets are required for testing — all data is mock data. Auth can be bypassed locally or tested with real Firebase accounts if the config is valid.
