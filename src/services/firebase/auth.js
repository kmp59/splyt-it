import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile,
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

export async function signOut() {
  return fbSignOut(auth)
}

export function onAuthStateChanged(callback) {
  return fbOnAuthStateChanged(auth, callback)
}
