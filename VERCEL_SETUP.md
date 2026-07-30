# Vercel Deployment Setup

Steps to deploy splyt-it to Vercel.

## 1. Add the SPA rewrite config

This app uses `BrowserRouter` (client-side routing), so Vercel needs to rewrite all unmatched paths to `index.html` — otherwise refreshing on a route like `/dashboard` returns a 404.

Create `vercel.json` in the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 2. Import the project

1. Push this repo to GitHub (if not already there).
2. Go to the [Vercel dashboard](https://vercel.com/dashboard) → **Add New → Project**.
3. Import the `splyt-it` repo. Vercel auto-detects Vite:
   - Build command: `vite build`
   - Output directory: `dist`
   - Install command: `npm install`

No changes needed to these defaults.

## 3. Set environment variables

In **Project Settings → Environment Variables**, add the same variables from your `.env.local` (see `FIREBASE_SETUP.md` for how to get the Firebase values):

```
VITE_DATA_MODE=prod
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

- Set each for **Production**, **Preview**, and **Development** environments as needed.
- If you want preview/staging deployments to run against local demo data instead of a real Firebase project, set `VITE_DATA_MODE=local` for the Preview environment and omit the Firebase vars there.

Vite bakes `VITE_*` vars into the build at build time, so any change to these requires a redeploy to take effect.

## 4. Authorize the Vercel domain in Firebase

Firebase Auth only allows sign-in from domains you've authorized:

1. In the Firebase console, go to **Authentication → Settings → Authorized domains**.
2. Add your Vercel domain(s), e.g. `splyt-it.vercel.app` and any custom domain you attach later.

## 5. Deploy

1. Click **Deploy** in Vercel. It will build and deploy automatically.
2. Every push to the connected branch triggers a new deployment (production for the main branch, preview for others).

## 6. Verify

1. Visit the deployed URL.
2. Sign up / log in with email+password.
3. Navigate to `/dashboard` and refresh the page directly — it should load correctly, not 404 (confirms the rewrite rule works).
4. Create a group/expense and confirm it shows up in Firestore.