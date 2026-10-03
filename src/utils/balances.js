function toCents(n) {
  return Math.round(n * 100)
}

// Splits `amount` into whole-cent shares that add up to it exactly. `shares`
// (uid → number) gives the proportions — equal numbers for an equal split,
// dollar amounts or percentages otherwise. Whatever cents are left after
// rounding down go to the largest fractional remainders, ties broken by uid so
// every client lands on the same answer. Returns uid → dollars.
export function splitInCents(amount, shares) {
  const entries = Object.entries(shares ?? {})
  if (entries.length === 0) return {}
  const total = toCents(amount)
  let weightSum = entries.reduce((s, [, w]) => s + w, 0)
  const weights = weightSum > 0 ? entries : entries.map(([uid]) => [uid, 1])
  if (weightSum <= 0) weightSum = entries.length

  const parts = weights.map(([uid, w]) => {
    const exact = (total * w) / weightSum
    const floor = Math.floor(exact + 1e-9)
    return { uid, cents: floor, frac: exact - floor }
  })
  let left = total - parts.reduce((s, p) => s + p.cents, 0)
  const order = [...parts].sort((a, b) => b.frac - a.frac || (a.uid < b.uid ? -1 : 1))
  for (let i = 0; left > 0 && i < order.length; i = (i + 1) % order.length, left--) order[i].cents++

  return Object.fromEntries(parts.map((p) => [p.uid, p.cents / 100]))
}

// Everyone's net balance in dollars, in whole cents that add up to exactly
// zero. Without a saved plan, each person's exact balance is rounded once and
// the leftover cents go to the largest fractional remainders (ties by uid).
// With a saved plan, balances follow the plan's rows — what settle-up says
// each person pays or is owed — so "owes" and "due" always match, whatever
// cents rounding did when the plan was made.
export function calculateBalances(expenses, payments = [], plan = null) {
  const cents = plan ? balancesFromPlan(expenses, plan) : roundedBalances(expenses)

  for (const payment of payments) {
    cents[payment.from] = (cents[payment.from] ?? 0) + toCents(payment.amount)
    cents[payment.to]   = (cents[payment.to]   ?? 0) - toCents(payment.amount)
  }

  return Object.fromEntries(Object.entries(cents).map(([uid, c]) => [uid, c / 100]))
}

function roundedBalances(expenses) {
  const exact = Object.entries(exactBalances(expenses)).map(([uid, dollars]) => {
    const value = dollars * 100
    const floor = Math.floor(value + 1e-6)
    return { uid, cents: floor, frac: value - floor }
  })
  let left = -exact.reduce((s, p) => s + p.cents, 0)
  const order = [...exact].sort((a, b) => b.frac - a.frac || (a.uid < b.uid ? -1 : 1))
  for (let i = 0; left > 0 && i < order.length; i = (i + 1) % order.length, left--) order[i].cents++
  return Object.fromEntries(exact.map((p) => [p.uid, p.cents]))
}

function balancesFromPlan(expenses, plan) {
  const cents = {}
  for (const { from, to, cents: c } of [...(plan.rows ?? []), ...rowsForLaterExpenses(plan, expenses)]) {
    cents[from] = (cents[from] ?? 0) - c
    cents[to]   = (cents[to]   ?? 0) + c
  }
  return cents
}

// The unrounded balances a settlement plan is built from. Plans saved before
// splits were kept to whole cents hold these (rounded once), so the plan and
// its "added since" check keep using them and saved plans never shift.
function exactBalances(expenses) {
  const balances = {}
  for (const { paidBy, amount, splits } of expenses) {
    balances[paidBy] = (balances[paidBy] ?? 0) + amount
    for (const [uid, owed] of Object.entries(splits ?? {})) {
      balances[uid] = (balances[uid] ?? 0) - owed
    }
  }
  return balances
}

// Settle Up. The group's saved plan (see createSettlementPlan) is shown as-is
// and never recalculated — recorded payments only mark its rows paid.
//   - A payment pays the row with the same from → to (the debtor and who they
//     owe). `paidBy`, when set, is who actually handed over the money on the
//     debtor's behalf (e.g. Bansari paying Yuvraj's rows); the row is still
//     Yuvraj's, so balances and the plan are unaffected by who paid.
//   - Expenses added after the plan was saved get their own rows (`added`),
//     listed separately so the saved rows never change.
//   - A payment that matches no row (e.g. one recorded before plans were
//     saved) is returned in `otherPayments` and touches nothing.
// `plan` may be null (not saved yet / couldn't load): one is built on the fly.
export function settlementStatus(expenses, payments = [], plan = null) {
  const saved = plan ?? createSettlementPlan(expenses)
  const rows = [
    ...(saved.rows ?? []).map((r) => ({ ...r, added: false })),
    ...rowsForLaterExpenses(saved, expenses).map((r) => ({ ...r, added: true })),
  ].map((r) => ({ from: r.from, to: r.to, cents: r.cents, added: r.added, paidCents: 0, payments: [] }))

  const otherPayments = []
  const ordered = payments
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      // Payments recorded this session may not carry a date yet; they're the newest.
      const da = a.p.date ?? '\uffff'
      const db = b.p.date ?? '\uffff'
      return da < db ? -1 : da > db ? 1 : a.i - b.i
    })
  for (const { p } of ordered) {
    let rest = toCents(p.amount)
    for (const row of rows) {
      if (rest === 0) break
      if (row.from !== p.from || row.to !== p.to || row.paidCents >= row.cents) continue
      const take = Math.min(rest, row.cents - row.paidCents)
      row.paidCents += take
      row.payments.push(p)
      rest -= take
    }
    if (rest > 0) otherPayments.push({ ...p, unmatchedAmount: rest / 100 })
  }

  return {
    rows: rows.map((r) => ({
      from: r.from,
      to: r.to,
      amount: r.cents / 100,
      remaining: (r.cents - r.paidCents) / 100,
      paid: r.paidCents >= r.cents,
      added: r.added,
      payments: r.payments,
    })),
    otherPayments,
  }
}

// The plan that gets saved on the group. `rows` is who pays whom (in cents,
// before any payments); `balances` is everyone's net balance in cents at the
// moment it was made, so expenses added later can be told apart.
export function createSettlementPlan(expenses) {
  const balances = {}
  for (const [uid, balance] of Object.entries(exactBalances(expenses))) {
    const cents = toCents(balance)
    if (cents !== 0) balances[uid] = cents
  }
  const rows = Object.entries(basePlan(exactBalances(expenses))).map(([key, cents]) => {
    const [from, to] = key.split('|')
    return { from, to, cents }
  })
  return { rows, balances }
}

// Rows covering any change in balances since the plan was saved (expenses
// added, edited or deleted afterwards), as extra rows alongside the saved ones.
function rowsForLaterExpenses(plan, expenses) {
  const delta = {}
  const now = exactBalances(expenses)
  for (const uid of new Set([...Object.keys(now), ...Object.keys(plan.balances ?? {})])) {
    const diff = toCents(now[uid] ?? 0) - (plan.balances?.[uid] ?? 0)
    if (diff !== 0) delta[uid] = diff / 100
  }
  return Object.entries(basePlan(delta)).map(([key, cents]) => {
    const [from, to] = key.split('|')
    return { from, to, cents }
  })
}

// Guest merge: everything the guest owed or was owed moves onto the real
// member. A row between the two of them disappears (they're one person now).
export function mergeUidInPlan(plan, guestUid, targetUid) {
  const owed = {}
  for (const { from, to, cents } of plan.rows ?? []) {
    addEdge(owed, from === guestUid ? targetUid : from, to === guestUid ? targetUid : to, cents)
  }
  const balances = { ...(plan.balances ?? {}) }
  if (guestUid in balances) {
    balances[targetUid] = (balances[targetUid] ?? 0) + balances[guestUid]
    delete balances[guestUid]
    if (balances[targetUid] === 0) delete balances[targetUid]
  }
  const rows = Object.entries(owed).map(([key, cents]) => {
    const [from, to] = key.split('|')
    return { from, to, cents }
  })
  return { ...plan, rows, balances }
}

// Base plan: the fewest-payments greedy — largest debtor pays largest
// creditor, repeat. Returns owed[`${from}|${to}`] = cents.
function basePlan(balances) {
  // Matches on exact balances and rounds each row at the end — the same
  // amounts the pre-existing greedy showed, so payments people already
  // recorded against those rows (e.g. $319.26) clear them exactly instead of
  // leaving a stray cent on a row that's been paid in full.
  const creditors = []
  const debtors = []
  for (const [uid, balance] of Object.entries(balances)) {
    if (balance > 0.005) creditors.push({ uid, amount: balance })
    else if (balance < -0.005) debtors.push({ uid, amount: -balance })
  }

  // Ties broken by uid so every client builds the identical plan.
  const byAmount = (a, b) => b.amount - a.amount || (a.uid < b.uid ? -1 : 1)
  creditors.sort(byAmount)
  debtors.sort(byAmount)

  const owed = {}
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)
    const cents = toCents(amount)
    if (cents > 0) owed[`${debtor.uid}|${creditor.uid}`] = cents
    debtor.amount -= amount
    creditor.amount -= amount
    if (debtor.amount < 0.005) i++
    if (creditor.amount < 0.005) j++
  }
  return owed
}

// Adds a from→to row of `cents`, netting against an existing to→from row.
function addEdge(owed, from, to, cents) {
  if (cents <= 0 || from === to) return
  const reverse = owed[`${to}|${from}`] ?? 0
  const cancel = Math.min(reverse, cents)
  if (cancel > 0) {
    owed[`${to}|${from}`] = reverse - cancel
    if (owed[`${to}|${from}`] === 0) delete owed[`${to}|${from}`]
  }
  if (cents > cancel) owed[`${from}|${to}`] = (owed[`${from}|${to}`] ?? 0) + cents - cancel
}
