# Firestore rules regression suite

Runs `firestore.rules` against the Firestore emulator and asserts, per rule,
who can and can't perform each write — a real security-boundary check, not a
UI test (the app's client code is never in the trust boundary; only these
rules are).

## Running

```bash
npm run test:rules          # one-shot run, exits non-zero on failure
npm run test:rules:watch    # re-run on change (kills the emulator on Ctrl-C)
```

Both scripts start (and tear down) a Firestore emulator automatically via
`firebase emulators:exec` — you don't need one already running.

### Requirement: JDK 21+

The Firestore emulator needs a JDK 21 or newer on `PATH`/`JAVA_HOME`. If your
default `java` is older (`java -version`), install one without touching your
system default, e.g.:

```bash
brew install openjdk@21
export JAVA_HOME=/usr/local/opt/openjdk@21   # or /opt/homebrew/... on Apple Silicon
export PATH="$JAVA_HOME/bin:$PATH"
npm run test:rules
```

## Layout

- `helpers.js` — shared emulator setup: `getTestEnv()`, `asUser(uid)`,
  `asAnon()`, and `seed(fn)` (writes fixtures with rules disabled, for
  setting up state a test doesn't itself want to be asserting on).
- `users.test.js` — `/users` collection: create/update/delete, and the
  isGuest-immutability fix in particular.
- `membership.test.js` — group membership carve-outs: self-join, invite,
  guest-add, member-remove, guest-remove.
- `admin.test.js` — promoting/demoting admins: creator-only grant, owner-or-
  admin revoke (including self-step-down), and that nobody can ever demote
  the owner.
- `payments.test.js` — the guest-merge payment carve-outs (repoint one side,
  or delete on a from==to collapse), admin-gated, and that ordinary payments
  stay immutable.
- `expenses.test.js` — light sanity coverage; this PR didn't touch expense
  rules.

## Notes for whoever edits `firestore.rules` next

- Test files run sequentially on purpose (`fileParallelism: false` in
  `vitest.config.js`) — they all share one emulator project and
  `afterEach` wipes it, so parallel files would race each other's fixtures.
- Prefer `seed()` for fixture setup and a real `asUser(...)` call for the one
  write under test — that keeps each test asserting on exactly one rule
  decision instead of also re-proving that setup worked.
- A green suite here doesn't replace deploying to a real project and
  smoke-testing the app — it only proves the rules match these specific
  scenarios. Add a case here whenever you add or change a carve-out.
