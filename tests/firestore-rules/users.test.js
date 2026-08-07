import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { asAnon, asUser, getTestEnv, seed, teardownTestEnv } from './helpers.js'

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

describe('/users create', () => {
  it('a user can create their own profile doc', async () => {
    const db = await asUser('alice')
    await assertSucceeds(
      setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'alice@x.com', displayName: 'Alice' })
    )
  })

  it('a user cannot create a profile doc under someone else\'s uid', async () => {
    const db = await asUser('alice')
    await assertFails(
      setDoc(doc(db, 'users', 'bob'), { uid: 'bob', email: 'bob@x.com', displayName: 'Bob' })
    )
  })

  it('a signed-in user can create a guest placeholder under any auto-id', async () => {
    const db = await asUser('alice')
    await assertSucceeds(
      setDoc(doc(db, 'users', 'guest1'), { isGuest: true, email: '', displayName: 'Jordan' })
    )
  })

  it('a guest placeholder cannot smuggle in a non-empty email', async () => {
    const db = await asUser('alice')
    await assertFails(
      setDoc(doc(db, 'users', 'guest1'), { isGuest: true, email: 'not-a-guest@x.com', displayName: 'Jordan' })
    )
  })
})

describe('/users update — isGuest immutability', () => {
  it('a real user cannot flip their own isGuest to true', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'a@x.com', displayName: 'Alice' }))
    const db = await asUser('alice')
    await assertFails(updateDoc(doc(db, 'users', 'alice'), { isGuest: true }))
  })

  it('a real user can still edit ordinary fields on their own doc', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'a@x.com', displayName: 'Alice' }))
    const db = await asUser('alice')
    await assertSucceeds(updateDoc(doc(db, 'users', 'alice'), { displayName: 'Alicia' }))
  })

  it('a user cannot update someone else\'s profile doc', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'a@x.com', displayName: 'Alice' }))
    const db = await asUser('bob')
    await assertFails(updateDoc(doc(db, 'users', 'alice'), { displayName: 'Hacked' }))
  })

  it('flipping isGuest back to its existing value is a no-op that still succeeds', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'guest1'), { isGuest: true, email: '', displayName: 'Jordan' }))
    // No one can authenticate as a guest, but this documents that the check
    // is "value unchanged", not "field absent" — belt and suspenders.
    const db = await asUser('guest1')
    await assertSucceeds(updateDoc(doc(db, 'users', 'guest1'), { isGuest: true, displayName: 'Jordan R' }))
  })
})

describe('/users delete', () => {
  it('a user can delete their own real profile doc', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'a@x.com', displayName: 'Alice' }))
    const db = await asUser('alice')
    await assertSucceeds(deleteDoc(doc(db, 'users', 'alice')))
  })

  it('a user cannot delete someone else\'s real profile doc', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'a@x.com', displayName: 'Alice' }))
    const db = await asUser('bob')
    await assertFails(deleteDoc(doc(db, 'users', 'alice')))
  })

  it('any signed-in user can delete a guest placeholder (mergeGuestIntoMember cleanup)', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'guest1'), { isGuest: true, email: '', displayName: 'Jordan' }))
    const db = await asUser('bob') // bob has no relationship to this guest at all
    await assertSucceeds(deleteDoc(doc(db, 'users', 'guest1')))
  })

  it('an unauthenticated request cannot delete anything', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'guest1'), { isGuest: true, email: '', displayName: 'Jordan' }))
    const db = await asAnon()
    await assertFails(deleteDoc(doc(db, 'users', 'guest1')))
  })
})

describe('/users read', () => {
  it('the collection cannot be enumerated via a list query', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'alice'), { uid: 'alice', email: 'a@x.com', displayName: 'Alice' }))
    const db = await asUser('bob')
    await assertFails(getDocs(collection(db, 'users')))
  })
})
