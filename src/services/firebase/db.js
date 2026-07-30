// Re-export all CRUD functions from the existing Firebase utility module,
// then add subscribe wrappers that mirror the local db's subscription API.

export {
  createGroup,
  joinGroup,
  completeGroup,
  archiveGroup,
  reopenGroup,
  addGuestToGroup,
  addMemberToGroup,
  recordPayment,
  getPayments,
  getUserGroups,
  getGroupById,
  getGroupMembers,
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
  searchUsers,
} from '../../utils/firestore'

import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase'

export function subscribeToUserGroups(uid, onData, onError) {
  const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', uid))
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      onData(docs)
    },
    onError
  )
}

export function subscribeToGroup(groupId, onData, onError) {
  return onSnapshot(
    doc(db, 'groups', groupId),
    (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  )
}

export function subscribeToExpenses(groupId, onData, onError) {
  return onSnapshot(
    collection(db, 'groups', groupId, 'expenses'),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      onData(docs)
    },
    onError
  )
}
