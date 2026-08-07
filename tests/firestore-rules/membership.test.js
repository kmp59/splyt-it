import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { arrayRemove, arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore'
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

// Baseline fixture: alice is the creator/owner of a 2-member group (alice,
// bob), plus one guest (guest1) already a member. Individual tests seed
// extra pendingMemberIds/adminIds on top of this where relevant.
async function seedGroup(overrides = {}) {
  await seed(async (db) => {
    await setDoc(doc(db, 'groups', 'g1'), {
      name: 'Trip',
      createdBy: 'alice',
      memberIds: ['alice', 'bob', 'guest1'],
      totalExpenses: 0,
      ...overrides,
    })
    await setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'a@x.com', displayName: 'Alice' })
    await setDoc(doc(db, 'users', 'bob'), { uid: 'bob', email: 'b@x.com', displayName: 'Bob' })
    await setDoc(doc(db, 'users', 'carol'), { uid: 'carol', email: 'c@x.com', displayName: 'Carol' })
    await setDoc(doc(db, 'users', 'guest1'), { isGuest: true, email: '', displayName: 'Jordan' })
  })
}

describe('group create', () => {
  it('a signed-in user can create a group naming themself as creator and member', async () => {
    const db = await asUser('alice')
    await assertSucceeds(
      setDoc(doc(db, 'groups', 'g1'), { name: 'Trip', createdBy: 'alice', memberIds: ['alice'], totalExpenses: 0 })
    )
  })

  it('cannot create a group claiming someone else as creator', async () => {
    const db = await asUser('alice')
    await assertFails(
      setDoc(doc(db, 'groups', 'g1'), { name: 'Trip', createdBy: 'bob', memberIds: ['alice'], totalExpenses: 0 })
    )
  })

  it('adminIds at creation time may only ever name the creator', async () => {
    const db = await asUser('alice')
    await assertFails(
      setDoc(doc(db, 'groups', 'g1'), {
        name: 'Trip', createdBy: 'alice', memberIds: ['alice', 'bob'], adminIds: ['alice', 'bob'], totalExpenses: 0,
      })
    )
  })
})

describe('isSelfJoin', () => {
  it('a non-member can add only themselves via arrayUnion', async () => {
    await seedGroup()
    const db = await asUser('carol')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayUnion('carol') }))
  })

  it('cannot self-join by naming someone else in the same write', async () => {
    await seedGroup()
    const db = await asUser('carol')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { memberIds: ['alice', 'bob', 'guest1', 'carol', 'mallory'] }))
  })
})

describe('isMemberInvite', () => {
  it('a member can invite one email/uid pair', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertSucceeds(
      updateDoc(doc(db, 'groups', 'g1'), {
        pendingMemberIds: arrayUnion('carol'),
        memberEmails: arrayUnion('c@x.com'),
      })
    )
  })

  it('a non-member cannot invite anyone', async () => {
    await seedGroup()
    const db = await asUser('carol')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { pendingMemberIds: arrayUnion('carol') }))
  })
})

describe('isGuestAdd', () => {
  it('a member can add a genuine guest to memberIds', async () => {
    await seedGroup()
    await seed((db) => setDoc(doc(db, 'users', 'guest2'), { isGuest: true, email: '', displayName: 'Sam' }))
    const db = await asUser('bob')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayUnion('guest2') }))
  })

  it('cannot use this path to add a real (non-guest) user without consent', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayUnion('carol') }))
  })
})

describe('isMemberRemove', () => {
  it('a member can remove themselves', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('bob') }))
  })

  it('the creator can remove another member', async () => {
    await seedGroup()
    const db = await asUser('alice')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('bob') }))
  })

  it('a non-creator member cannot remove someone else', async () => {
    await seedGroup({ memberIds: ['alice', 'bob', 'carol'] })
    const db = await asUser('bob')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('carol') }))
  })

  it('nobody can remove the creator this way — not even the creator themself', async () => {
    await seedGroup()
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('alice') }))
  })
})

describe('isGuestRemove — admin-gated', () => {
  it('an admin can remove a guest from memberIds', async () => {
    await seedGroup({ adminIds: ['bob'] })
    const db = await asUser('bob')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('guest1') }))
  })

  it('the creator (implicit admin) can remove a guest', async () => {
    await seedGroup()
    const db = await asUser('alice')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('guest1') }))
  })

  it('a plain, non-admin member cannot remove a guest via this path', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('guest1') }))
  })

  it('cannot be used to remove a real (non-guest) member, even by an admin', async () => {
    // carol is a third real member here so this can't accidentally succeed
    // via isMemberRemove's self-removal or creator-removal paths instead —
    // bob is an admin but not the creator, and isn't removing himself.
    await seedGroup({ memberIds: ['alice', 'bob', 'carol', 'guest1'], adminIds: ['bob'] })
    const db = await asUser('bob')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { memberIds: arrayRemove('carol') }))
  })
})
