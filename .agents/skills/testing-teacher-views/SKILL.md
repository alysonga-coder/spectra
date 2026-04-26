# Testing Spectra Teacher Views

This skill covers end-to-end testing of the teacher-facing pages: Dashboard, Assignments, and Reports.

## Prerequisites

- Node.js installed (project uses React via Create React App)
- Run `npm install` in the repo root

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

The teacher routes are:
- `/teacher/dashboard` — Dashboard with student cards, assignments, past assignments
- `/teacher/assignments` — Assignment creation + published assignments tracking
- `/teacher/reports` — Reports with sidebar + tabbed detail views
- `/teacher/settings` — Settings page

## Key Test Flows for Reports Page

The Reports page (`src/pages/teacher/TeacherReports.jsx`) uses mock data from `src/lib/mockData.js`.

### Sidebar
- 4 subject groups: Mathematics, Reading, Science, Social Skills
- Each group is collapsible (click header to toggle)
- Assignments have color-coded dots (coral = flagged, amber = warning, teal = good)
- Default selection: first assignment (Addition Q1-Q5)

### Tabs (per assignment)
1. **Overview**: 4 stat cards (Avg Score, Completion, AI Reframes, Avg Engagement) + Score by Learning Style bars + Reframes by Strategy bars + Question Difficulty Heatmap
2. **Per Student**: Student performance table with avatar, mode badge, score/engagement bars, reframes, pattern detected + AI Reframe Log with severity badges
3. **Questions**: Per-question breakdown cards with success %, reframes, descriptions. Flagged questions have red/coral border
4. **Insights**: Color-coded Gemma insight cards (warning=red, amber=yellow, info=blue, positive=green) + Recommendations section at bottom

### What to Verify
- Sidebar navigation switches the selected assignment and updates all tab content
- Tab switching works without errors
- Flagged questions (e.g., Q3 in Addition) show red borders
- "Recommendations" label is used (not "AI recommendations")
- No date range filters or flagged chat phrases sections exist
- Bold text in insight cards renders correctly without XSS (uses `escapeHtml` + `renderBoldMarkdown`)

## Mock Data Structure

All data is in `src/lib/mockData.js`:
- `STUDENTS` — 5 students (jamie, maya, eli, sofia, aisha)
- `REPORT_ASSIGNMENTS` — 8 assignments across 4 subjects
- `REPORT_SUBJECT_META` — Subject icons and colors
- Each assignment has: overview stats, student results, reframe log, questions, insights

## Common Issues

- If the page shows a blank screen or redirect, the auth bypass might not be applied correctly. Check the browser console for errors.
- The dev server may take 10-20 seconds for initial compilation. Wait for the "Compiled successfully" message in the terminal.
- Port 3000 might already be in use from a previous session. Check with `lsof -i :3000` and kill any existing processes.

## Devin Secrets Needed

No secrets are required for testing — all data is mock data and auth is bypassed locally.
