import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

// When VITE_DATA_MODE=local the Firebase SDK is imported but never initialised,
// so the app works without any Firebase credentials configured.
const IS_LOCAL = import.meta.env.VITE_DATA_MODE === 'local'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app  = IS_LOCAL ? null : initializeApp(firebaseConfig)
export const auth = IS_LOCAL ? null : getAuth(app)
export const db   = IS_LOCAL ? null : initializeFirestore(app, {
  experimentalForceLongPolling: true,
})
