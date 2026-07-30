# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**splyt-it** — split any cost with your crew in seconds. Trips, dinners, gifts — Splyt keeps it fair and effortless.

React + Vite app with Firebase (Auth + Firestore), Tailwind CSS v4, React Router, Lucide icons, and clsx.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server
npm run build      # production build
npm run lint       # run ESLint
```

## Environment

Copy `.env.local` and fill in your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Architecture

- `src/firebase.js` — Firebase init; exports `app`, `auth`, `db` (Firestore)
- `src/components/auth/` — login, signup, auth guards
- `src/components/groups/` — group creation and list views
- `src/components/expenses/` — expense forms and summaries
- `src/components/ui/` — shared UI primitives
- `src/context/` — React context providers (e.g. AuthContext)
- `src/hooks/` — custom hooks
- `src/pages/` — top-level route pages wired up in App.jsx
- `src/utils/` — pure helper functions (splitting logic, formatting, etc.)
