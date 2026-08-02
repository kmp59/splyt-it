import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
