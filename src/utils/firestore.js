import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

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

  // Creator is a full member immediately; everyone else is invited and must
  // accept before they gain memberIds (and therefore expense/payment access).
  const pendingMemberIds = Array.from(new Set(resolvedUids.filter((uid) => uid !== createdByUid)))

  const groupRef = await addDoc(collection(db, 'groups'), {
    name,
    createdBy: createdByUid,
    memberIds: [createdByUid],
    adminIds: [createdByUid],
    pendingMemberIds,
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

export async function acceptInvite(groupId, uid) {
  const groupRef = doc(db, 'groups', groupId)
  await updateDoc(groupRef, {
    memberIds: arrayUnion(uid),
    pendingMemberIds: arrayRemove(uid),
  })
}

export async function declineInvite(groupId, uid) {
  const groupRef = doc(db, 'groups', groupId)
  await updateDoc(groupRef, {
    pendingMemberIds: arrayRemove(uid),
  })
}

export async function getPendingInvites(uid) {
  const q = query(collection(db, 'groups'), where('pendingMemberIds', 'array-contains', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function completeGroup(groupId) {
  await updateDoc(doc(db, 'groups', groupId), { completed: true })
}

export async function archiveGroup(groupId) {
  await updateDoc(doc(db, 'groups', groupId), { archived: true })
}

export async function reopenGroup(groupId) {
  await updateDoc(doc(db, 'groups', groupId), { completed: false, archived: false })
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
    pendingMemberIds: arrayUnion(uids[0]),
    memberEmails: arrayUnion(cleaned),
  })
}

// Only the group creator may promote/demote admins (see isAdminGrant /
// isAdminRevoke in firestore.rules). Admins can do everything an ordinary
// member can, plus merge a guest into a real member — merging rewrites
// someone else's expense/payment history, so it's gated to a smaller,
// creator-vetted set of people rather than every member.
export async function promoteToAdmin(groupId, targetUid) {
  await updateDoc(doc(db, 'groups', groupId), {
    adminIds: arrayUnion(targetUid),
  })
}

export async function demoteAdmin(groupId, targetUid) {
  await updateDoc(doc(db, 'groups', groupId), {
    adminIds: arrayRemove(targetUid),
  })
}

// Self-leave or creator-removal. The group creator can't be removed this way
// (see isMemberRemove in firestore.rules) — ownership transfer isn't
// supported yet, so the creator must archive the group instead of leaving.
export async function removeMember(groupId, targetUid) {
  const snap = await getDoc(doc(db, 'groups', groupId))
  if (!snap.exists()) throw new Error('Group not found')
  if (targetUid === snap.data().createdBy) {
    throw Object.assign(new Error('Group owner cannot be removed'), { code: 'member/is-creator' })
  }
  await updateDoc(doc(db, 'groups', groupId), {
    memberIds: arrayRemove(targetUid),
  })
}

// Reassigns everything a guest placeholder touched — expense paidBy/splits,
// payment from/to — onto a real member, then drops the guest from the
// group and deletes their placeholder profile. Unlike removeMember(), this
// never requires a zero balance: the guest's balance is meant to transfer
// onto targetUid, not be settled away.
export async function mergeGuestIntoMember(groupId, guestUid, targetUid) {
  if (guestUid === targetUid) {
    throw Object.assign(new Error('Cannot merge a member into themselves'), { code: 'merge/same-uid' })
  }

  const [guestSnap, targetSnap, groupSnap] = await Promise.all([
    getDoc(doc(db, 'users', guestUid)),
    getDoc(doc(db, 'users', targetUid)),
    getDoc(doc(db, 'groups', groupId)),
  ])
  if (!guestSnap.exists() || !guestSnap.data().isGuest) {
    throw Object.assign(new Error('Not a guest'), { code: 'merge/not-a-guest' })
  }
  if (!groupSnap.exists() || !(groupSnap.data().memberIds ?? []).includes(targetUid)) {
    throw Object.assign(new Error('Target is not a member of this group'), { code: 'merge/target-not-member' })
  }
  const targetName = targetSnap.exists() ? (targetSnap.data().displayName ?? targetSnap.data().email ?? 'Member') : 'Member'

  const [expensesSnap, paymentsSnap] = await Promise.all([
    getDocs(collection(db, 'groups', groupId, 'expenses')),
    getDocs(collection(db, 'groups', groupId, 'payments')),
  ])

  const batch = writeBatch(db)

  for (const expDoc of expensesSnap.docs) {
    const exp = expDoc.data()
    const update = {}
    if (exp.paidBy === guestUid) {
      update.paidBy = targetUid
      update.paidByName = targetName
    }
    if (exp.splits && guestUid in exp.splits) {
      const splits = { ...exp.splits }
      const guestShare = splits[guestUid]
      delete splits[guestUid]
      // Same expense already had a split for targetUid (e.g. both the guest
      // and the real person were on it by mistake) — combine rather than
      // silently drop one share.
      splits[targetUid] = (splits[targetUid] ?? 0) + guestShare
      update.splits = splits
    }
    if (Object.keys(update).length > 0) batch.update(expDoc.ref, update)
  }

  for (const payDoc of paymentsSnap.docs) {
    const pay = payDoc.data()
    if (pay.from !== guestUid && pay.to !== guestUid) continue
    const from = pay.from === guestUid ? targetUid : pay.from
    const to = pay.to === guestUid ? targetUid : pay.to
    if (from === to) {
      // A prior settle-up between the guest and the person they're being
      // merged into — now meaningless ("paid themselves"), so drop it.
      batch.delete(payDoc.ref)
    } else {
      batch.update(payDoc.ref, { from, to })
    }
  }

  batch.update(doc(db, 'groups', groupId), { memberIds: arrayRemove(guestUid) })

  await batch.commit()
  // Best-effort cleanup — /users isn't group-scoped so it can't ride in the
  // same batch as a group-owned failure guard; a stray orphaned guest doc
  // left behind here is harmless (nothing references it anymore).
  await deleteDoc(doc(db, 'users', guestUid)).catch(() => {})
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

// Lookup is by exact email only — resolved via /emailIndex (get-only) then a
// single get() on /users. No `list` query, so the directory can't be
// enumerated by partial name/email match (see firestore.rules).
export async function lookupUserByEmail(email, excludeUid) {
  const cleaned = email.trim().toLowerCase()
  if (!cleaned) return null

  const { uids } = await resolveEmailsToUids([cleaned])
  if (!uids.length || uids[0] === excludeUid) return null

  const snap = await getDoc(doc(db, 'users', uids[0]))
  if (!snap.exists()) return null
  const data = snap.data()
  if (data.isGuest) return null

  return { uid: snap.id, displayName: data.displayName, email: data.email }
}

export async function getGroupMembers(memberIds) {
  if (!memberIds?.length) return {}
  const profiles = {}
  await Promise.all(
    memberIds.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid))
      profiles[uid] = snap.exists()
        ? snap.data()
        : { uid, displayName: 'Member', email: '' }
    })
  )
  return profiles
}

// "Contacts" for the invite-search box in CreateGroupModal: everyone the
// caller already shares an accepted group with. This is intentionally NOT a
// directory search — /users denies `list` (see firestore.rules) so no
// signed-in user can enumerate the full user base by partial name/email.
// This instead reuses the existing per-doc get() path (getGroupMembers),
// scoped to uids the caller can already see via their own group memberships.
export async function getContacts(uid) {
  const groups = await getUserGroups(uid)
  const uids = new Set()
  groups.forEach((g) => {
    ;(g.memberIds ?? []).forEach((id) => {
      if (id !== uid) uids.add(id)
    })
  })
  if (!uids.size) return []

  const profiles = await getGroupMembers([...uids])
  return Object.entries(profiles)
    .filter(([, p]) => !p.isGuest)
    .map(([id, p]) => ({ uid: id, displayName: p.displayName, email: p.email }))
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
