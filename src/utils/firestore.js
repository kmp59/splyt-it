import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  increment,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const SEARCH_RESULT_LIMIT = 8

// Email->uid resolution goes through the /emailIndex collection — one get()
// per email — rather than a where(email, 'in', emails) query on /users.
async function resolveEmailsToUids(emails) {
  if (!emails.length) return { uids: [], resolvedEmails: [] }
  const snaps = await Promise.all(emails.map((email) => getDoc(doc(db, 'emailIndex', email))))
  const uids = []
  const resolvedEmails = []
  snaps.forEach((snap, i) => {
    if (!snap.exists()) return
    uids.push(snap.data().uid)
    resolvedEmails.push(emails[i])
  })
  return { uids, resolvedEmails }
}

export async function createGroup(name, createdByUid, memberEmails) {
  const cleaned = memberEmails.map((e) => e.trim().toLowerCase()).filter(Boolean)
  const { uids: resolvedUids } = await resolveEmailsToUids(cleaned)

  const memberIds = Array.from(new Set([createdByUid, ...resolvedUids]))

  const groupRef = await addDoc(collection(db, 'groups'), {
    name,
    createdBy: createdByUid,
    memberIds,
    memberEmails: cleaned,
    createdAt: serverTimestamp(),
    totalExpenses: 0,
  })

  return groupRef.id
}

export async function joinGroup(groupId, uid) {
  const groupRef = doc(db, 'groups', groupId)
  await updateDoc(groupRef, {
    memberIds: arrayUnion(uid),
  })
}

export async function completeGroup(groupId) {
  await updateDoc(doc(db, 'groups', groupId), { completed: true })
}

export async function reopenGroup(groupId) {
  await updateDoc(doc(db, 'groups', groupId), { completed: false })
}

export async function addGuestToGroup(groupId, displayName) {
  const userRef = await addDoc(collection(db, 'users'), {
    displayName: displayName.trim(),
    email: '',
    isGuest: true,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'groups', groupId), {
    memberIds: arrayUnion(userRef.id),
  })
  return userRef.id
}

export async function addMemberToGroup(groupId, email) {
  const cleaned = email.trim().toLowerCase()
  const { uids } = await resolveEmailsToUids([cleaned])
  if (!uids.length) throw Object.assign(new Error('User not found'), { code: 'user/not-found' })
  await updateDoc(doc(db, 'groups', groupId), {
    memberIds: arrayUnion(uids[0]),
    memberEmails: arrayUnion(cleaned),
  })
}

export async function getUserGroups(uid) {
  const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getGroupById(groupId) {
  const snap = await getDoc(doc(db, 'groups', groupId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

// Firestore has no substring search, only prefix range queries. `/users` allows
// `list` for signed-in callers capped at SEARCH_RESULT_LIMIT (see firestore.rules) —
// this trades a small amount of enumerability (any signed-in user can look up
// others by partial name/email match) for not needing a paid Cloud Functions plan.
function prefixRange(value) {
  return [value, value.slice(0, -1) + String.fromCharCode(value.charCodeAt(value.length - 1) + 1)]
}

export async function searchUsers(term, excludeUid) {
  const cleaned = term.trim()
  if (cleaned.length < 2) return []

  const usersRef = collection(db, 'users')
  const runRange = (field, value) => {
    const [start, end] = prefixRange(value)
    return getDocs(query(usersRef, where(field, '>=', start), where(field, '<', end), limit(SEARCH_RESULT_LIMIT)))
  }

  const emailTerm = cleaned.toLowerCase()
  const nameTerm = cleaned
  const nameTermCapitalized = nameTerm[0].toUpperCase() + nameTerm.slice(1)

  const queries = [runRange('email', emailTerm), runRange('displayName', nameTerm)]
  if (nameTermCapitalized !== nameTerm) queries.push(runRange('displayName', nameTermCapitalized))

  const snapshots = await Promise.all(queries)

  const results = new Map()
  for (const snap of snapshots) {
    for (const d of snap.docs) {
      if (d.id === excludeUid || results.has(d.id)) continue
      const data = d.data()
      if (data.isGuest) continue
      results.set(d.id, { uid: d.id, displayName: data.displayName, email: data.email })
    }
  }

  return Array.from(results.values()).slice(0, SEARCH_RESULT_LIMIT)
}

export async function getGroupMembers(memberIds) {
  if (!memberIds?.length) return {}
  const profiles = {}
  await Promise.all(
    memberIds.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid))
      profiles[uid] = snap.exists()
        ? snap.data()
        : { uid, displayName: `User ${uid.slice(0, 6)}`, email: '' }
    })
  )
  return profiles
}

export async function addExpense(groupId, expense) {
  const ref = await addDoc(collection(db, 'groups', groupId, 'expenses'), {
    ...expense,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'groups', groupId), {
    totalExpenses: increment(expense.amount),
  })
  return ref.id
}

export async function getExpenses(groupId) {
  const snap = await getDocs(collection(db, 'groups', groupId, 'expenses'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function recordPayment(groupId, payment) {
  const ref = await addDoc(collection(db, 'groups', groupId, 'payments'), {
    ...payment,
    date: new Date().toISOString(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getPayments(groupId) {
  const snap = await getDocs(collection(db, 'groups', groupId, 'payments'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteExpense(groupId, expenseId, amount) {
  await deleteDoc(doc(db, 'groups', groupId, 'expenses', expenseId))
  await updateDoc(doc(db, 'groups', groupId), {
    totalExpenses: increment(-amount),
  })
}

export async function updateExpense(groupId, expenseId, expense, previousAmount) {
  await updateDoc(doc(db, 'groups', groupId, 'expenses', expenseId), { ...expense })
  await updateDoc(doc(db, 'groups', groupId), {
    totalExpenses: increment(expense.amount - previousAmount),
  })
}
