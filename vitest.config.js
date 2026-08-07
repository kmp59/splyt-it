import { defineConfig } from 'vitest/config'

// Scoped on purpose: this only runs the Firestore security-rules suite
// against the emulator (see tests/firestore-rules/README.md). The React app
// itself has no unit tests yet — when it does, give those their own config
// (jsdom environment) rather than widening this one.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/firestore-rules/**/*.test.js'],
    testTimeout: 20000,
    hookTimeout: 20000,
    // All test files share one Firestore emulator project (see helpers.js),
    // and afterEach wipes the whole project between tests. Running files in
    // parallel lets one file's clearFirestore() race another file's
    // still-in-flight fixtures — sequential files keeps each test's data
    // deterministic at a small cost in wall-clock time.
    fileParallelism: false,
  },
})
