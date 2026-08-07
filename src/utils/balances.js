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

// Non-simplified: net pairwise debts directly from expense splits.
// Each pair (A, B) produces at most one settlement after mutual debts cancel out.
export function calculatePairwiseSettlements(expenses, members, payments = []) {
  const owes = {} // owes[debtor][creditor] = amount

  for (const expense of expenses) {
    const { paidBy, splits } = expense
    for (const [uid, share] of Object.entries(splits ?? {})) {
      if (uid === paidBy || share < 0.005) continue
      if (!owes[uid]) owes[uid] = {}
      owes[uid][paidBy] = (owes[uid][paidBy] ?? 0) + share
    }
  }

  // Subtract recorded payments from pairwise debts
  for (const payment of payments) {
    if (!owes[payment.from]) owes[payment.from] = {}
    owes[payment.from][payment.to] = (owes[payment.from][payment.to] ?? 0) - payment.amount
  }

  const settlements = []
  const seen = new Set()

  for (const [a, creditors] of Object.entries(owes)) {
    for (const [b, aOwesB] of Object.entries(creditors)) {
      const key = a < b ? `${a}|${b}` : `${b}|${a}`
      if (seen.has(key)) continue
      seen.add(key)

      const bOwesA = owes[b]?.[a] ?? 0
      const net = aOwesB - bOwesA

      if (net > 0.005) {
        settlements.push({ from: a, fromName: members[a]?.displayName ?? 'Member', to: b, toName: members[b]?.displayName ?? 'Member', amount: Math.round(net * 100) / 100 })
      } else if (net < -0.005) {
        settlements.push({ from: b, fromName: members[b]?.displayName ?? 'Member', to: a, toName: members[a]?.displayName ?? 'Member', amount: Math.round(-net * 100) / 100 })
      }
    }
  }

  return settlements
}

// Simplified: minimises number of transactions via global net balance greedy matching.
export function calculateSettlements(balances, members) {
  const creditors = []
  const debtors = []

  for (const [uid, balance] of Object.entries(balances)) {
    if (balance > 0.005) creditors.push({ uid, amount: balance })
    else if (balance < -0.005) debtors.push({ uid, amount: -balance })
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const settlements = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)

    settlements.push({
      from: debtor.uid,
      fromName: members[debtor.uid]?.displayName ?? 'Member',
      to: creditor.uid,
      toName: members[creditor.uid]?.displayName ?? 'Member',
      amount: Math.round(amount * 100) / 100,
    })

    debtor.amount -= amount
    creditor.amount -= amount
    if (debtor.amount < 0.005) i++
    if (creditor.amount < 0.005) j++
  }

  return settlements
}
