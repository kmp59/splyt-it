import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
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

// alice = creator/owner (admin), bob = plain member, mallory = not in the group.
async function seedGroup() {
  await seed((db) => setDoc(doc(db, 'groups', 'g1'), {
    name: 'Trip',
    createdBy: 'alice',
    memberIds: ['alice', 'bob', 'guest1'],
    totalExpenses: 0,
    completed: true,
  }))
}

const planFor = (uid) => ({
  rows: [{ from: 'bob', to: 'alice', cents: 1000 }],
  balances: { alice: 1000, bob: -1000 },
  createdBy: uid,
  createdAt: serverTimestamp(),
})

async function seedPlan() {
  await seed((db) => setDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), {
    rows: [{ from: 'bob', to: 'alice', cents: 1000 }],
    balances: { alice: 1000, bob: -1000 },
    createdBy: 'bob',
    createdAt: new Date(),
  }))
}

describe('settlement plan create', () => {
  it('a group member can save the plan once', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertSucceeds(setDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), planFor('bob')))
  })

  it('a non-member cannot save a plan', async () => {
    await seedGroup()
    const db = await asUser('mallory')
    await assertFails(setDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), planFor('mallory')))
  })

  it('createdBy must be the caller', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(setDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), planFor('alice')))
  })

  it('only the "plan" doc id is allowed', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(setDoc(doc(db, 'groups', 'g1', 'settlement', 'other'), planFor('bob')))
  })

  it('extra fields are rejected', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(setDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), { ...planFor('bob'), locked: false }))
  })
})

describe('settlement plan is never overwritten', () => {
  it('a plain member cannot overwrite an existing plan', async () => {
    await seedGroup()
    await seedPlan()
    const db = await asUser('bob')
    await assertFails(setDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), planFor('bob')))
    await assertFails(updateDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), { rows: [] }))
  })

  it('an admin can update rows/balances (guest merge) but nothing else', async () => {
    await seedGroup()
    await seedPlan()
    const db = await asUser('alice')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), {
      rows: [{ from: 'bob', to: 'alice', cents: 1000 }],
      balances: { alice: 1000, bob: -1000 },
    }))
    await assertFails(updateDoc(doc(db, 'groups', 'g1', 'settlement', 'plan'), { createdBy: 'alice' }))
  })

  it('nobody can delete the plan, not even an admin', async () => {
    await seedGroup()
    await seedPlan()
    await assertFails(deleteDoc(doc(await asUser('alice'), 'groups', 'g1', 'settlement', 'plan')))
    await assertFails(deleteDoc(doc(await asUser('bob'), 'groups', 'g1', 'settlement', 'plan')))
  })
})

describe('settlement plan read', () => {
  it('members can read it, non-members cannot', async () => {
    await seedGroup()
    await seedPlan()
    await assertSucceeds(getDoc(doc(await asUser('bob'), 'groups', 'g1', 'settlement', 'plan')))
    await assertFails(getDoc(doc(await asUser('mallory'), 'groups', 'g1', 'settlement', 'plan')))
  })
})
