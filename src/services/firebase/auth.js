import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'

async function setEmailIndex(uid, email) {
  await setDoc(doc(db, 'emailIndex', email), { uid })
}

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  const email = user.email.toLowerCase()
  if (snap.exists()) {
    await setEmailIndex(user.uid, email)
    return
  }
  await setDoc(ref, {
    uid: user.uid,
    email,
    displayName: user.displayName || user.email.split('@')[0],
  })
  await setEmailIndex(user.uid, email)
}

export async function signIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserDoc(user)
  return { user }
}

export async function signUp(email, password, displayName) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  const normalizedEmail = user.email.toLowerCase()
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: normalizedEmail,
    displayName,
  })
  await setEmailIndex(user.uid, normalizedEmail)
  return { user }
}

// Browsers that block third-party storage/cookies (Safari ITP, Brave, an
// in-app webview, or Chrome with "block third-party cookies" on) can't
// complete the popup handshake — the popup gets stuck on the bare
// authDomain instead of relaying the result back and closing itself. In
// that case fall back to a full-page redirect, which round-trips through
// the same authDomain handler but returns control to *this* origin
// (splyt-it.vercel.app) rather than stranding the user on
// splyt-it.firebaseapp.com. `auth/popup-closed-by-user` and
// `auth/cancelled-popup-request` are the user deliberately backing out —
// those should not retry.
const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/web-storage-unsupported',
  'auth/internal-error',
])

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  try {
    const { user } = await signInWithPopup(auth, provider)
    await ensureUserDoc(user)
    return { user }
  } catch (err) {
    if (POPUP_FALLBACK_CODES.has(err.code)) {
      // Navigates away; execution resumes via completeGoogleRedirect()
      // after Firebase redirects back to this page.
      await signInWithRedirect(auth, provider)
      return { user: null }
    }
    throw err
  }
}

// Call on mount of any page that renders <GoogleSignInButton>, so a
// signInWithGoogle() that fell back to signInWithRedirect finishes
// properly (user doc creation) once the browser lands back here.
export async function completeGoogleRedirect() {
  const result = await getRedirectResult(auth)
  if (!result) return null
  await ensureUserDoc(result.user)
  return result.user
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

// Changing a password is a "sensitive" operation — Firebase requires the
// session to be freshly authenticated, so we reauthenticate with the
// caller-supplied current password first rather than asking the user to
// sign out and back in.
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}

export async function changeDisplayName(displayName) {
  const user = auth.currentUser
  await updateProfile(user, { displayName })
  await setDoc(doc(db, 'users', user.uid), { displayName }, { merge: true })
}

export function getCurrentUser() {
  const user = auth.currentUser
  return user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null
}

export async function signOut() {
  return fbSignOut(auth)
}

export function onAuthStateChanged(callback) {
  return fbOnAuthStateChanged(auth, callback)
}
