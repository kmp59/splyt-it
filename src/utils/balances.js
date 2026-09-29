function toCents(n) {
  return Math.round(n * 100)
}

export function calculateBalances(expenses, payments = []) {
  const balances = {}

  for (const expense of expenses) {
    const { paidBy, amount, splits } = expense
    balances[paidBy] = (balances[paidBy] ?? 0) + amount
    for (const [uid, owed] of Object.entries(splits ?? {})) {
      balances[uid] = (balances[uid] ?? 0) - owed
    }
  }

  for (const payment of payments) {
    balances[payment.from] = (balances[payment.from] ?? 0) + payment.amount
    balances[payment.to]   = (balances[payment.to]   ?? 0) - payment.amount
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
  for (const [uid, balance] of Object.entries(calculateBalances(expenses))) {
    const cents = toCents(balance)
    if (cents !== 0) balances[uid] = cents
  }
  const rows = Object.entries(basePlan(calculateBalances(expenses))).map(([key, cents]) => {
    const [from, to] = key.split('|')
    return { from, to, cents }
  })
  return { rows, balances }
}

// Rows covering any change in balances since the plan was saved (expenses
// added, edited or deleted afterwards), as extra rows alongside the saved ones.
function rowsForLaterExpenses(plan, expenses) {
  const delta = {}
  const now = calculateBalances(expenses)
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
