# Firebase Setup

Steps to configure a Firebase project for splyt-it. Only needed when running with `VITE_DATA_MODE=prod` — skip all of this for local/demo mode (`VITE_DATA_MODE=local`).

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/).
2. Click **Add project**, name it (e.g. `splyt-it`), and follow the prompts (Google Analytics is optional, not used by this app).

## 2. Register a Web app

1. In the project's **Project settings** (gear icon) → **General** tab, scroll to **Your apps**.
2. Click the **</>** (Web) icon to register a new web app.
3. Give it a nickname (e.g. `splyt-it-web`) — no need to set up Firebase Hosting here.
4. Firebase will show a `firebaseConfig` object. Keep this page open — you'll copy these values into `.env.local` in step 5.

## 3. Enable Authentication

1. In the left sidebar, go to **Build → Authentication**.
2. Click **Get started**.
3. Under **Sign-in method**, enable **Email/Password** (this is the only provider `src/services/firebase/auth.js` uses).

## 4. Enable Firestore

1. In the left sidebar, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose a location, and start in **production mode** (locked down by default).
4. Set up the CLI once, if you haven't already:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add   # pick/link this Firebase project
   ```

5. Deploy the rules checked into this repo at [`firestore.rules`](firestore.rules) instead of hand-editing rules in the console:

   ```bash
   firebase deploy --only firestore:rules
   ```

   `firestore.rules` scopes `groups`, `groups/{id}/expenses`, and `groups/{id}/payments` to `memberIds`, with a carve-out for self-join via `joinGroup()`'s `arrayUnion` (see the comments in the file for why that can't just be a plain membership check). `emailIndex` denies `list` outright — email lookup goes through it via `get()` by normalized email. `users` allows `list`, but only for signed-in callers and capped at 8 results per query, which is what the member-search box (Create Group → add member) uses (`searchUsers` in `src/utils/firestore.js`). This keeps everything on the free **Spark** plan — no Cloud Functions/Blaze billing required.

## 5. Fill in `.env.local`

1. Copy the example file if you haven't already:
   ```bash
   cp .env.local.example .env.local
   ```
2. Set `VITE_DATA_MODE=prod`.
3. Fill in the six `VITE_FIREBASE_*` values from the `firebaseConfig` object in step 2:
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```
4. Restart the dev server (`npm run dev`) so Vite picks up the new env vars.

## 6. Verify

1. Run `npm run dev`.
2. Sign up with a new email/password on the signup page.
3. Check **Authentication → Users** in the Firebase console for the new account, and **Firestore Database → Data → emailIndex** for the matching email→uid entry.
4. Create a group/expense in the app and check **Firestore Database → Data** for the new documents.
5. In Create Group, type into the "add member" search box and confirm results come back (this now queries `/users` directly from the client — check the browser console for a permission-denied error if it doesn't, which would mean the rules in step 4 above didn't deploy).
