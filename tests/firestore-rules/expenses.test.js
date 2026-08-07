// Lighter sanity coverage for the expense rules, which this PR didn't touch
// — just enough to catch an accidental regression, not full coverage.
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
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

async function seedGroup() {
  await seed((db) =>
    setDoc(doc(db, 'groups', 'g1'), {
      name: 'Trip', createdBy: 'alice', memberIds: ['alice', 'bob'], totalExpenses: 0,
    })
  )
}

describe('expenses', () => {
  it('a member can create a valid expense they added themselves', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertSucceeds(
      setDoc(doc(db, 'groups', 'g1', 'expenses', 'e1'), {
        description: 'Dinner', amount: 40, paidBy: 'bob', splitType: 'equal',
        splits: { alice: 20, bob: 20 }, addedBy: 'bob',
      })
    )
  })

  it('cannot claim someone else added the expense', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(
      setDoc(doc(db, 'groups', 'g1', 'expenses', 'e1'), {
        description: 'Dinner', amount: 40, paidBy: 'bob', splitType: 'equal',
        splits: { alice: 20, bob: 20 }, addedBy: 'alice',
      })
    )
  })

  it('a non-member cannot create an expense in this group', async () => {
    await seedGroup()
    const db = await asUser('mallory')
    await assertFails(
      setDoc(doc(db, 'groups', 'g1', 'expenses', 'e1'), {
        description: 'Dinner', amount: 40, paidBy: 'bob', splitType: 'equal',
        splits: { alice: 20, bob: 20 }, addedBy: 'mallory',
      })
    )
  })

  it('amount must be positive and under the cap', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(
      setDoc(doc(db, 'groups', 'g1', 'expenses', 'e1'), {
        description: 'Too much', amount: 99999999, paidBy: 'bob', splitType: 'equal',
        splits: { alice: 20, bob: 20 }, addedBy: 'bob',
      })
    )
  })

  it('addedBy cannot change on update, even by another member', async () => {
    await seedGroup()
    await seed((db) =>
      setDoc(doc(db, 'groups', 'g1', 'expenses', 'e1'), {
        description: 'Dinner', amount: 40, paidBy: 'bob', splitType: 'equal',
        splits: { alice: 20, bob: 20 }, addedBy: 'bob',
      })
    )
    const db = await asUser('alice')
    await assertFails(
      updateDoc(doc(db, 'groups', 'g1', 'expenses', 'e1'), { addedBy: 'alice' })
    )
  })
})
