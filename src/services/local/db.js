import { lsGet, lsSet, lsSubscribe, lsId } from '../../lib/localStore'

const GRP_KEY = 'splyt_groups'
const USR_KEY = 'splyt_users'
const expKey = (gid) => `splyt_expenses_${gid}`
const payKey = (gid) => `splyt_payments_${gid}`

const readGroups = () => lsGet(GRP_KEY, [])
const writeGroups = (g) => lsSet(GRP_KEY, g)
const readUsers = () => lsGet(USR_KEY, [])
const readExp = (gid) => lsGet(expKey(gid), [])
const writeExp = (gid, e) => lsSet(expKey(gid), e)
const readPay = (gid) => lsGet(payKey(gid), [])
const writePay = (gid, p) => lsSet(payKey(gid), p)

// ---------------------------------------------------------------------------
// Seed demo data on first login so the UI is immediately interesting
// ---------------------------------------------------------------------------
function seedIfEmpty(uid) {
  if (readGroups().length > 0) return

  const ALICE = 'demo-alice'
  const BOB = 'demo-bob'

  // Ensure demo friends exist in the user table
  const users = readUsers()
  const extras = [
    { uid: ALICE, email: 'alice@demo.com', displayName: 'Alice', password: 'demo' },
    { uid: BOB,   email: 'bob@demo.com',   displayName: 'Bob',   password: 'demo' },
  ]
  lsSet(USR_KEY, [
    ...users,
    ...extras.filter((x) => !users.find((u) => u.uid === x.uid)),
  ])

  const now = Date.now()
  const GID1 = 'demo-g1'
  const GID2 = 'demo-g2'

  lsSet(GRP_KEY, [
    {
      id: GID1,
      name: 'Cabo Trip',
      createdBy: uid,
      memberIds: [uid, ALICE, BOB],
      memberEmails: ['alice@demo.com', 'bob@demo.com'],
      createdAt: { seconds: (now - 86400000) / 1000 },
      totalExpenses: 450,
    },
    {
      id: GID2,
      name: 'Apartment',
      createdBy: uid,
      memberIds: [uid, ALICE],
      memberEmails: ['alice@demo.com'],
      createdAt: { seconds: (now - 3600000) / 1000 },
      totalExpenses: 120,
    },
  ])

  lsSet(expKey(GID1), [
    {
      id: 'e1',
      description: 'Airbnb',
      amount: 300,
      paidBy: uid,
      paidByName: 'You',
      splitType: 'equal',
      splits: { [uid]: 100, [ALICE]: 100, [BOB]: 100 },
      date: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'e2',
      description: 'Dinner at La Mar',
      amount: 150,
      paidBy: ALICE,
      paidByName: 'Alice',
      splitType: 'equal',
      splits: { [uid]: 50, [ALICE]: 50, [BOB]: 50 },
      date: new Date(now - 43200000).toISOString(),
    },
  ])

  lsSet(expKey(GID2), [
    {
      id: 'e3',
      description: 'Internet bill',
      amount: 120,
      paidBy: ALICE,
      paidByName: 'Alice',
      splitType: 'equal',
      splits: { [uid]: 60, [ALICE]: 60 },
      date: new Date(now).toISOString(),
    },
  ])
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------
export async function createGroup(name, createdByUid, memberEmails) {
  const cleaned = memberEmails.map((e) => e.trim().toLowerCase()).filter(Boolean)
  const users = readUsers()
  const resolvedUids = cleaned
    .map((email) => users.find((u) => u.email === email)?.uid)
    .filter(Boolean)
  const pendingMemberIds = Array.from(new Set(resolvedUids.filter((uid) => uid !== createdByUid)))
  const id = lsId()
  writeGroups([
    ...readGroups(),
    {
      id,
      name,
      createdBy: createdByUid,
      memberIds: [createdByUid],
      pendingMemberIds,
      memberEmails: cleaned,
      createdAt: { seconds: Date.now() / 1000 },
      totalExpenses: 0,
    },
  ])
  return id
}

export async function joinGroup(groupId, uid) {
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  if (!groups[idx].memberIds.includes(uid)) {
    groups[idx] = { ...groups[idx], memberIds: [...groups[idx].memberIds, uid] }
    writeGroups(groups)
  }
}

export async function acceptInvite(groupId, uid) {
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  groups[idx] = {
    ...groups[idx],
    memberIds: groups[idx].memberIds.includes(uid) ? groups[idx].memberIds : [...groups[idx].memberIds, uid],
    pendingMemberIds: (groups[idx].pendingMemberIds ?? []).filter((id) => id !== uid),
  }
  writeGroups(groups)
}

export async function declineInvite(groupId, uid) {
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  groups[idx] = {
    ...groups[idx],
    pendingMemberIds: (groups[idx].pendingMemberIds ?? []).filter((id) => id !== uid),
  }
  writeGroups(groups)
}

export async function getPendingInvites(uid) {
  return readGroups().filter((g) => g.pendingMemberIds?.includes(uid))
}

export async function completeGroup(groupId) {
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  groups[idx] = { ...groups[idx], completed: true }
  writeGroups(groups)
}

export async function archiveGroup(groupId) {
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  groups[idx] = { ...groups[idx], archived: true }
  writeGroups(groups)
}

export async function reopenGroup(groupId) {
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  groups[idx] = { ...groups[idx], completed: false, archived: false }
  writeGroups(groups)
}

export async function addGuestToGroup(groupId, displayName) {
  const uid = lsId()
  const users = readUsers()
  lsSet(USR_KEY, [...users, { uid, displayName: displayName.trim(), email: '', isGuest: true }])
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  groups[idx] = { ...groups[idx], memberIds: [...groups[idx].memberIds, uid] }
  writeGroups(groups)
  return uid
}

export async function addMemberToGroup(groupId, email) {
  const cleaned = email.trim().toLowerCase()
  const user = readUsers().find((u) => u.email === cleaned)
  if (!user) throw Object.assign(new Error('User not found'), { code: 'user/not-found' })
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx === -1) throw new Error('Group not found')
  const alreadyThere =
    groups[idx].memberIds.includes(user.uid) || (groups[idx].pendingMemberIds ?? []).includes(user.uid)
  if (!alreadyThere) {
    groups[idx] = {
      ...groups[idx],
      pendingMemberIds: [...(groups[idx].pendingMemberIds ?? []), user.uid],
      memberEmails: [...(groups[idx].memberEmails ?? []), cleaned],
    }
    writeGroups(groups)
  }
}

export async function getUserGroups(uid) {
  return readGroups().filter((g) => g.memberIds?.includes(uid))
}

export async function getGroupById(groupId) {
  return readGroups().find((g) => g.id === groupId) ?? null
}

export async function lookupUserByEmail(email, excludeUid) {
  const cleaned = email.trim().toLowerCase()
  if (!cleaned) return null
  const user = readUsers().find((u) => u.email === cleaned && !u.isGuest)
  if (!user || user.uid === excludeUid) return null
  return { uid: user.uid, displayName: user.displayName, email: user.email }
}

export async function getGroupMembers(memberIds) {
  const users = readUsers()
  return Object.fromEntries(
    memberIds.map((uid) => {
      const u = users.find((u) => u.uid === uid)
      return [uid, u ? { uid, displayName: u.displayName, email: u.email }
                     : { uid, displayName: `User ${uid.slice(0, 6)}`, email: '' }]
    })
  )
}

// "Contacts" for the invite-search box: everyone the caller already shares
// an accepted group with — mirrors the Firebase impl's scoping (see
// services/firebase/db.js / utils/firestore.js) rather than a full directory
// search across every local user.
export async function getContacts(uid) {
  const groups = readGroups().filter((g) => g.memberIds?.includes(uid))
  const uids = new Set()
  groups.forEach((g) => {
    (g.memberIds ?? []).forEach((id) => {
      if (id !== uid) uids.add(id)
    })
  })
  const users = readUsers()
  return [...uids]
    .map((id) => users.find((u) => u.uid === id))
    .filter((u) => u && !u.isGuest)
    .map((u) => ({ uid: u.uid, displayName: u.displayName, email: u.email }))
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------
export async function addExpense(groupId, expense) {
  const id = lsId()
  writeExp(groupId, [...readExp(groupId), { id, ...expense }])
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx !== -1) {
    groups[idx] = { ...groups[idx], totalExpenses: (groups[idx].totalExpenses ?? 0) + expense.amount }
    writeGroups(groups)
  }
  return id
}

export async function getExpenses(groupId) {
  return readExp(groupId)
}

export async function deleteExpense(groupId, expenseId, amount) {
  writeExp(groupId, readExp(groupId).filter((e) => e.id !== expenseId))
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx !== -1) {
    groups[idx] = { ...groups[idx], totalExpenses: Math.max(0, (groups[idx].totalExpenses ?? 0) - amount) }
    writeGroups(groups)
  }
}

export async function updateExpense(groupId, expenseId, expense, previousAmount) {
  writeExp(groupId, readExp(groupId).map((e) => (e.id === expenseId ? { ...e, ...expense, id: expenseId } : e)))
  const groups = readGroups()
  const idx = groups.findIndex((g) => g.id === groupId)
  if (idx !== -1) {
    groups[idx] = { ...groups[idx], totalExpenses: Math.max(0, (groups[idx].totalExpenses ?? 0) + expense.amount - previousAmount) }
    writeGroups(groups)
  }
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export async function recordPayment(groupId, payment) {
  const id = lsId()
  writePay(groupId, [...readPay(groupId), { id, ...payment, date: new Date().toISOString() }])
  return id
}

export async function getPayments(groupId) {
  return readPay(groupId)
}

// ---------------------------------------------------------------------------
// Real-time subscriptions (mirrors Firebase onSnapshot behavior)
// ---------------------------------------------------------------------------
export function subscribeToUserGroups(uid, onData, onError) {
  seedIfEmpty(uid)
  function push() {
    try {
      const groups = readGroups()
        .filter((g) => g.memberIds?.includes(uid))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      onData(groups)
    } catch (err) {
      onError?.(err)
    }
  }
  push()
  return lsSubscribe(GRP_KEY, push)
}

export function subscribeToPendingInvites(uid, onData, onError) {
  function push() {
    try {
      const groups = readGroups()
        .filter((g) => g.pendingMemberIds?.includes(uid))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      onData(groups)
    } catch (err) {
      onError?.(err)
    }
  }
  push()
  return lsSubscribe(GRP_KEY, push)
}

export function subscribeToGroup(groupId, onData, onError) {
  function push() {
    try {
      onData(readGroups().find((g) => g.id === groupId) ?? null)
    } catch (err) {
      onError?.(err)
    }
  }
  push()
  return lsSubscribe(GRP_KEY, push)
}

export function subscribeToExpenses(groupId, onData, onError) {
  function push() {
    try {
      const expenses = readExp(groupId).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      onData(expenses)
    } catch (err) {
      onError?.(err)
    }
  }
  push()
  return lsSubscribe(expKey(groupId), push)
}
