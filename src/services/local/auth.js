import { lsGet, lsSet, lsSubscribe, lsId } from '../../lib/localStore'

const USERS_KEY = 'splyt_users'
const SESSION_KEY = 'splyt_session'

const readUsers = () => lsGet(USERS_KEY, [])
const writeUsers = (u) => lsSet(USERS_KEY, u)

// Ensure the demo account always exists so the pre-filled credentials work
// on a fresh browser even before the user has signed up.
;(function seedDemoUser() {
  const users = readUsers()
  if (!users.find((u) => u.email === 'demo@example.com')) {
    writeUsers([
      ...users,
      { uid: 'demo-user', email: 'demo@example.com', displayName: 'Demo User', password: 'password' },
    ])
  }
})()

export async function signIn(email, password) {
  const user = readUsers().find(
    (u) => u.email === email.toLowerCase() && u.password === password
  )
  if (!user) throw Object.assign(new Error('Bad credentials'), { code: 'auth/invalid-credential' })
  const session = { uid: user.uid, email: user.email, displayName: user.displayName }
  lsSet(SESSION_KEY, session)
  return { user: session }
}

export async function signUp(email, password, displayName) {
  const users = readUsers()
  if (users.find((u) => u.email === email.toLowerCase()))
    throw Object.assign(new Error('Already in use'), { code: 'auth/email-already-in-use' })
  const uid = lsId()
  const newUser = { uid, email: email.toLowerCase(), displayName, password }
  writeUsers([...users, newUser])
  const session = { uid, email: newUser.email, displayName }
  lsSet(SESSION_KEY, session)
  return { user: session }
}

// Local mode has no email transport, so there's nothing to actually send.
// Mirrors Firebase's fire-and-forget behavior (resolves regardless of
// whether the email matches an account) so the UI flow works the same.
export async function resetPassword() {}

export async function changePassword(currentPassword, newPassword) {
  const session = lsGet(SESSION_KEY, null)
  if (!session) throw Object.assign(new Error('Not signed in'), { code: 'auth/no-current-user' })
  const users = readUsers()
  const idx = users.findIndex((u) => u.uid === session.uid)
  if (idx === -1 || users[idx].password !== currentPassword)
    throw Object.assign(new Error('Bad credentials'), { code: 'auth/wrong-password' })
  const updated = [...users]
  updated[idx] = { ...updated[idx], password: newPassword }
  writeUsers(updated)
}

export async function changeDisplayName(displayName) {
  const session = lsGet(SESSION_KEY, null)
  if (!session) throw Object.assign(new Error('Not signed in'), { code: 'auth/no-current-user' })
  const users = readUsers()
  const idx = users.findIndex((u) => u.uid === session.uid)
  if (idx !== -1) {
    const updated = [...users]
    updated[idx] = { ...updated[idx], displayName }
    writeUsers(updated)
  }
  // lsSet triggers the subscription below, which re-notifies onAuthStateChanged
  // listeners — so this alone keeps AuthContext's user in sync in local mode.
  lsSet(SESSION_KEY, { ...session, displayName })
}

export function getCurrentUser() {
  return lsGet(SESSION_KEY, null)
}

export async function signOut() {
  lsSet(SESSION_KEY, null)
}

export function onAuthStateChanged(callback) {
  callback(lsGet(SESSION_KEY, null))
  return lsSubscribe(SESSION_KEY, () => callback(lsGet(SESSION_KEY, null)))
}
