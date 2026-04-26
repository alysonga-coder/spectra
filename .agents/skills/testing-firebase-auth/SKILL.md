# Testing Firebase Authentication

This skill covers testing Firebase Auth and Firestore flows in the Spectra app.

## Prerequisites

- Node.js installed
- Run `npm install` in the repo root
- The Firebase config in `src/lib/firebase.js` must contain valid values (not placeholders like `YOUR_API_KEY`)

## Starting the Dev Server

```bash
cd /home/ubuntu/repos/spectra
npm run start:client
```

Dev server runs on **port 3000** at `http://localhost:3000`.

## Key Auth Routes

| Route | Purpose |
|---|---|
| `/` | Landing page with role selection |
| `/teacher/login` | Teacher email/password login |
| `/teacher/signup` | Teacher account creation |
| `/student/login` | Student email/password login |
| `/student/signup` | Student account creation |

## Auth Architecture

- `src/lib/firebase.js` — Firebase app initialization (config values here)
- `src/lib/AuthContext.jsx` — Auth state management, login/signup/logout functions
- `src/App.js` — `RequireTeacher` and `RequireStudent` route guards

Auth uses `signInWithEmailAndPassword` and `createUserWithEmailAndPassword` from Firebase Auth.
User profiles are stored in Firestore `users` collection with a `role` field (`teacher` or `student`).

## Testing Signup Flow

1. Navigate to `/teacher/signup` (or `/student/signup`)
2. Fill all required fields (name, email, password, confirm password, school, room)
3. Click "Create account"
4. **Pass**: Redirects to `/teacher/dashboard` (or `/student/home`)
5. **Fail**: Error banner appears — check for `api-key-not-valid` (bad config) or `email-already-in-use` (duplicate account)

## Testing Login Flow

1. Navigate to `/teacher/login` (or `/student/login`)
2. Enter email and password
3. Click "Sign in"
4. **Pass**: Redirects to dashboard
5. **Fail**: Error banner with specific Firebase error code

## Testing Without .env File

The `.env` file is gitignored. To simulate the deployed experience:
1. Ensure no `.env` file exists in the repo root
2. Start the dev server
3. Verify the app loads without `auth/api-key-not-valid` errors in the browser console
4. If errors appear, the Firebase config in `src/lib/firebase.js` might have placeholder values

## Common Firebase Error Codes

| Error Code | Meaning |
|---|---|
| `auth/api-key-not-valid` | Firebase config has invalid/placeholder API key |
| `auth/email-already-in-use` | Account already exists with that email |
| `auth/invalid-credential` | Wrong email or password |
| `auth/weak-password` | Password too short (min 6 chars) |
| `auth/invalid-email` | Malformed email address |

## Logout

Logout button is at the bottom of the Settings page (`/teacher/settings` or `/student/settings`). After logout, the app redirects to the landing page `/`.

## Devin Secrets Needed

No secrets required — Firebase client config is hardcoded in the source code. Test accounts can be created via the signup flow.
