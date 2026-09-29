import { useState, useEffect } from 'react'
import clsx from 'clsx'
import confetti from 'canvas-confetti'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { settlementStatus, createSettlementPlan } from '../../utils/balances'
import { getPayments, recordPayment, getSettlementPlan, ensureSettlementPlan } from '../../services/db'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
}

// Firestore Timestamp, local-mode { seconds }, or nothing.
function planDate(createdAt) {
  const secs = createdAt?.seconds ?? (typeof createdAt?.toMillis === 'function' ? createdAt.toMillis() / 1000 : null)
  return secs ? new Date(secs * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
}

const SECTION_LABEL = 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block'

export default function SettleUpModal({ groupId, expenses, members, currentUid, onArchive, archiving, onClose }) {
  const [payments, setPayments] = useState([])
  const [plan, setPlan] = useState(undefined) // undefined = loading, null = couldn't load/save
  const [confirming, setConfirming] = useState(null) // row key whose "who paid?" picker is open
  const [payer, setPayer] = useState('')
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    getPayments(groupId).then(setPayments)
  }, [groupId])

  // Load the group's saved plan; groups completed before plans were saved
  // (or whose save at completion failed) get theirs locked in right here.
  useEffect(() => {
    let cancelled = false
    getSettlementPlan(groupId)
      .then((saved) => saved ?? ensureSettlementPlan(groupId, createSettlementPlan(expenses), currentUid))
      .then((p) => { if (!cancelled) setPlan(p) })
      .catch((err) => {
        console.error('Could not load or save settlement plan', err)
        if (!cancelled) setPlan(null) // fall back to a plan calculated on the fly
      })
    return () => { cancelled = true }
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps -- expenses are only needed if no plan exists yet

  const nameOf = (uid) => (uid === currentUid ? 'You' : (members[uid]?.displayName ?? members[uid]?.email ?? 'Member'))
  const status = plan === undefined ? null : settlementStatus(expenses, payments, plan)
  const rowKey = (r) => `${r.added ? 'added' : 'saved'}|${r.from}|${r.to}`
  const allSettled = !!status && status.rows.every((r) => r.paid)

  function openConfirm(row) {
    setConfirming(rowKey(row))
    setPayer(row.from)
  }

  // Always pays off what's left on the row. `from` stays the debtor so the
  // row (and everyone's balance) is settled; `paidBy` only records who
  // actually handed over the money when it wasn't the debtor.
  async function handleRecord(row) {
    setRecording(true)
    try {
      const payment = { from: row.from, to: row.to, amount: row.remaining, recordedBy: currentUid }
      if (payer && payer !== row.from) payment.paidBy = payer
      const id = await recordPayment(groupId, payment)
      setPayments((prev) => [...prev, { id, ...payment, date: new Date().toISOString() }])
      setConfirming(null)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } finally {
      setRecording(false)
    }
  }

  function renderRow(row) {
    const key = rowKey(row)
    const last = row.payments[row.payments.length - 1]
    const helpers = [...new Set(row.payments.map((p) => p.paidBy).filter((uid) => uid && uid !== row.from))]
    return (
      <div
        key={key}
        className={clsx(
          'border rounded-2xl px-4 py-3 text-sm',
          row.paid ? 'bg-green-950/20 border-green-800/40' : 'bg-slate-800/60 border-slate-800'
        )}
      >
        <div className="flex items-center gap-2">
          <Avatar name={members[row.from]?.displayName ?? nameOf(row.from)} uid={row.from} size="sm" />
          <span className={clsx('font-medium', row.from === currentUid ? 'text-green-300' : 'text-white')}>{nameOf(row.from)}</span>
          <ArrowRight size={13} className="text-slate-500 shrink-0" />
          <Avatar name={members[row.to]?.displayName ?? nameOf(row.to)} uid={row.to} size="sm" />
          <span className={clsx('font-medium', row.to === currentUid ? 'text-green-300' : 'text-white')}>
            {row.to === currentUid ? 'you' : nameOf(row.to)}
          </span>
          <span className="ml-auto font-semibold text-green-400 tabular-nums mr-3">{fmt(row.amount)}</span>
          {row.paid ? (
            <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-green-700/60 bg-green-950/40 text-green-400">
              <CheckCircle size={13} />
              Paid
            </span>
          ) : confirming !== key && (
            <button
              onClick={() => openConfirm(row)}
              className="shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-green-700 hover:text-green-400 hover:bg-green-950/40 transition-colors"
            >
              Record payment
            </button>
          )}
        </div>

        {row.payments.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-1.5">
            {[
              !row.paid && `${fmt(row.remaining)} left`,
              helpers.length > 0 && `Paid by ${helpers.map(nameOf).join(', ')}`,
              last?.date && fmtDate(last.date),
            ].filter(Boolean).join(' · ')}
          </p>
        )}

        {confirming === key && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-400" htmlFor={`payer-${key}`}>Who paid?</label>
            <select
              id={`payer-${key}`}
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-green-600"
            >
              {[row.from, ...Object.keys(members).filter((uid) => uid !== row.from && uid !== row.to)].map((uid) => (
                <option key={uid} value={uid}>
                  {nameOf(uid)}{uid === row.from ? '' : ` (for ${nameOf(row.from)})`}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 tabular-nums">{fmt(row.remaining)}</span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRecord(row)}
                disabled={recording}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-green-700 text-green-400 bg-green-950/40 hover:bg-green-950/70 disabled:opacity-40"
              >
                {recording ? 'Saving…' : 'Confirm payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const savedRows = status?.rows.filter((r) => !r.added) ?? []
  const addedRows = status?.rows.filter((r) => r.added) ?? []

  return (
    <Modal title="Settle up" onClose={onClose} size="lg">
      <div className="p-5 space-y-6">

        {/* Saved plan — fixed once saved; payments only mark rows paid */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className={SECTION_LABEL} style={{ marginBottom: 0 }}>Settlement plan</h3>
            {plan?.createdAt && <span className="text-[11px] text-slate-500">Saved {planDate(plan.createdAt)}</span>}
          </div>

          {!status ? (
            <p className="py-4 text-center text-sm text-slate-500">Loading plan…</p>
          ) : savedRows.length === 0 && addedRows.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 text-green-400">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Nobody owes anything.</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">{savedRows.map(renderRow)}</div>
              {allSettled && (
                <div className="flex items-center justify-center gap-2 pt-4 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Everyone is settled up!</span>
                </div>
              )}
            </>
          )}
        </div>

        {addedRows.length > 0 && (
          <div>
            <h3 className={SECTION_LABEL}>Added after the plan was saved</h3>
            <div className="space-y-2">{addedRows.map(renderRow)}</div>
          </div>
        )}

        {status?.otherPayments.length > 0 && (
          <div>
            <h3 className={SECTION_LABEL}>Other payments</h3>
            <p className="text-xs text-slate-500 mb-2">These don't match a row in the plan, so they don't mark anything paid.</p>
            <div className="space-y-2">
              {status.otherPayments.map((p) => (
                <div key={p.id} className="flex items-center gap-2 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-300">
                  <span>{nameOf(p.paidBy ?? p.from)} paid {p.to === currentUid ? 'you' : nameOf(p.to)}</span>
                  {p.paidBy && p.paidBy !== p.from && <span className="text-slate-500">for {nameOf(p.from)}</span>}
                  <span className="ml-auto tabular-nums">{fmt(p.unmatchedAmount)}</span>
                  <span className="text-[11px] text-slate-500">{fmtDate(p.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archive — only once every row in the plan is paid */}
        {allSettled && onArchive && (
          <div>
            <Button variant="danger" onClick={onArchive} disabled={archiving} className="w-full">
              {archiving ? 'Archiving…' : 'Archive group'}
            </Button>
          </div>
        )}

      </div>
    </Modal>
  )
}
