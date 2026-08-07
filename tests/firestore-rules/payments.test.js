import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { asUser, getTestEnv, seed, teardownTestEnv } from './helpers.js'

beforeAll(async () => {
  await getTestEnv()
})

afterEach(async () => {
  const env = await getTestEnv()
  await env.clearFirestore()
})

afterAll(async () => {
  await teardownTestEnv()
})

// alice = creator/owner (admin), bob = plain member, guest1 = a genuine
// guest, carol = a real member outside the group (not in memberIds).
async function seedGroup(overrides = {}) {
  await seed(async (db) => {
    await setDoc(doc(db, 'groups', 'g1'), {
      name: 'Trip',
      createdBy: 'alice',
      memberIds: ['alice', 'bob', 'guest1'],
      totalExpenses: 0,
      ...overrides,
    })
    await setDoc(doc(db, 'users', 'guest1'), { isGuest: true, email: '', displayName: 'Jordan' })
    await setDoc(doc(db, 'users', 'bob'), { uid: 'bob', email: 'b@x.com', displayName: 'Bob' })
  })
}

async function seedPayment(id, data) {
  await seed((db) => setDoc(doc(db, 'groups', 'g1', 'payments', id), data))
}

describe('payments create', () => {
  it('a group member can record a valid payment between two members', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertSucceeds(
      setDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'bob', to: 'alice', amount: 10 })
    )
  })

  it('a non-member cannot record a payment in this group', async () => {
    await seedGroup()
    const db = await asUser('mallory')
    await assertFails(
      setDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'bob', to: 'alice', amount: 10 })
    )
  })

  it('from and to cannot be the same person', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(
      setDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'bob', to: 'bob', amount: 10 })
    )
  })
})

describe('isPaymentGuestMerge — admin-gated repoint', () => {
  it('an admin can repoint a guest\'s side of a payment onto a real member', async () => {
    // Repointing onto carol (a third member, distinct from bob on the other
    // side of the payment) — repointing onto bob himself would collapse the
    // payment to from==to, which this carve-out correctly rejects (that's
    // what isPaymentGuestMergeDelete is for instead, covered below).
    await seedGroup({ memberIds: ['alice', 'bob', 'carol', 'guest1'] })
    await seed((db) => setDoc(doc(db, 'users', 'carol'), { uid: 'carol', email: 'c@x.com', displayName: 'Carol' }))
    await seedPayment('p1', { from: 'guest1', to: 'bob', amount: 25 })
    const db = await asUser('alice')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'carol' }))
  })

  it('a plain, non-admin member cannot repoint a guest\'s payment', async () => {
    await seedGroup()
    await seedPayment('p1', { from: 'guest1', to: 'bob', amount: 25 })
    const db = await asUser('bob')
    await assertFails(updateDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'alice' }))
  })

  it('cannot repoint the real member\'s side, only the guest\'s side', async () => {
    await seedGroup()
    await seedPayment('p1', { from: 'guest1', to: 'bob', amount: 25 })
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { to: 'alice' }))
  })

  it('cannot change the amount alongside a repoint', async () => {
    await seedGroup()
    await seedPayment('p1', { from: 'guest1', to: 'bob', amount: 25 })
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'bob', amount: 999 }))
  })

  it('cannot repoint onto a uid outside the group', async () => {
    await seedGroup()
    await seedPayment('p1', { from: 'guest1', to: 'bob', amount: 25 })
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'mallory' }))
  })

  it('cannot repoint a payment that has no guest on either side, even as an admin', async () => {
    await seedGroup({ memberIds: ['alice', 'bob', 'carol', 'guest1'] })
    await seed((db) => setDoc(doc(db, 'users', 'carol'), { uid: 'carol', email: 'c@x.com', displayName: 'Carol' }))
    await seedPayment('p1', { from: 'bob', to: 'carol', amount: 25 })
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1', 'payments', 'p1'), { from: 'alice' }))
  })
})

describe('isPaymentGuestMergeDelete', () => {
  it('an admin can delete a payment where one side is a guest', async () => {
    await seedGroup()
    await seedPayment('p1', { from: 'guest1', to: 'bob', amount: 25 })
    const db = await asUser('alice')
    await assertSucceeds(deleteDoc(doc(db, 'groups', 'g1', 'payments', 'p1')))
  })

  it('a plain, non-admin member cannot delete it', async () => {
    await seedGroup()
    await seedPayment('p1', { from: 'guest1', to: 'bob', amount: 25 })
    const db = await asUser('bob')
    await assertFails(deleteDoc(doc(db, 'groups', 'g1', 'payments', 'p1')))
  })

  it('cannot delete a real, non-guest payment — immutability holds for ordinary payments', async () => {
    await seedGroup({ memberIds: ['alice', 'bob', 'carol', 'guest1'] })
    await seed((db) => setDoc(doc(db, 'users', 'carol'), { uid: 'carol', email: 'c@x.com', displayName: 'Carol' }))
    await seedPayment('p1', { from: 'bob', to: 'carol', amount: 25 })
    const db = await asUser('alice')
    await assertFails(deleteDoc(doc(db, 'groups', 'g1', 'payments', 'p1')))
  })
})
