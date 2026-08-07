// Shared setup for the Firestore security-rules regression suite. Every test
// file imports getTestEnv() (lazily creates one shared emulator connection)
// plus the seed/as-user helpers below — keeps each *.test.js focused on
// rules behavior instead of emulator plumbing.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RULES_PATH = resolve(__dirname, '../../firestore.rules')

let testEnv

export async function getTestEnv() {
  if (!testEnv) {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-splyt-it-rules-test',
      firestore: {
        rules: readFileSync(RULES_PATH, 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    })
  }
  return testEnv
}

export async function teardownTestEnv() {
  if (testEnv) {
    await testEnv.cleanup()
    testEnv = undefined
  }
}

// Firestore instance for a signed-in user with the given uid — rules see
// this as request.auth.uid == uid.
export async function asUser(uid) {
  const env = await getTestEnv()
  return env.authenticatedContext(uid).firestore()
}

// Firestore instance for a request with no auth at all.
export async function asAnon() {
  const env = await getTestEnv()
  return env.unauthenticatedContext().firestore()
}

// Writes data bypassing security rules entirely — for seeding fixtures a
// test needs to already exist before exercising the rule under test (e.g. a
// group with existing members, before checking who can update it).
export async function seed(fn) {
  const env = await getTestEnv()
  await env.withSecurityRulesDisabled(async (context) => {
    await fn(context.firestore())
  })
}
