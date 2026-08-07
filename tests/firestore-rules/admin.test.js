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

// alice = creator/owner, bob = pre-promoted admin, carol = plain member.
async function seedGroup(overrides = {}) {
  await seed(async (db) => {
    await setDoc(doc(db, 'groups', 'g1'), {
      name: 'Trip',
      createdBy: 'alice',
      memberIds: ['alice', 'bob', 'carol'],
      adminIds: ['bob'],
      totalExpenses: 0,
      ...overrides,
    })
  })
}

describe('isAdminGrant — promoting is creator-only', () => {
  it('the creator can promote a current member to admin', async () => {
    await seedGroup()
    const db = await asUser('alice')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayUnion('carol') }))
  })

  it('an existing admin cannot promote someone else — only the creator can', async () => {
    await seedGroup()
    const db = await asUser('bob') // bob is already an admin, but not the creator
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayUnion('carol') }))
  })

  it('a plain member cannot promote themselves', async () => {
    await seedGroup()
    const db = await asUser('carol')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayUnion('carol') }))
  })

  it('cannot promote someone who is not even a member of the group', async () => {
    await seedGroup()
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayUnion('mallory') }))
  })
})

describe('isAdminRevoke — the owner requested behavior', () => {
  it('the owner/creator can demote an admin', async () => {
    await seedGroup()
    const db = await asUser('alice')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayRemove('bob') }))
  })

  it('another admin (not the owner) can also demote an admin', async () => {
    // dave is a second pre-promoted admin, demoting bob.
    await seedGroup({ memberIds: ['alice', 'bob', 'carol', 'dave'], adminIds: ['bob', 'dave'] })
    const db = await asUser('dave')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayRemove('bob') }))
  })

  it('an admin can step down (demote themself)', async () => {
    await seedGroup()
    const db = await asUser('bob')
    await assertSucceeds(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayRemove('bob') }))
  })

  it('a plain, non-admin member cannot demote anyone', async () => {
    await seedGroup()
    const db = await asUser('carol')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayRemove('bob') }))
  })

  it('nobody — not even the owner — can demote the owner', async () => {
    await seedGroup({ adminIds: ['alice', 'bob'] }) // even if alice's uid somehow ended up in adminIds too
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayRemove('alice') }))
  })

  it('an admin cannot demote the owner either', async () => {
    await seedGroup({ adminIds: ['alice', 'bob'] })
    const db = await asUser('bob')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayRemove('alice') }))
  })
})

describe('grant/revoke carve-outs stay narrow', () => {
  it('a single write cannot both grant and touch another field', async () => {
    await seedGroup()
    const db = await asUser('alice')
    await assertFails(
      updateDoc(doc(db, 'groups', 'g1'), { adminIds: arrayUnion('carol'), name: 'Renamed' })
    )
  })

  it('cannot grant more than one admin in a single write', async () => {
    await seedGroup({ memberIds: ['alice', 'bob', 'carol', 'dave'] })
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'groups', 'g1'), { adminIds: ['bob', 'carol', 'dave'] }))
  })
})
