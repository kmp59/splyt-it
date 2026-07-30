import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { ArrowRight, RotateCcw, CheckCircle } from 'lucide-react'
import { calculateBalances, calculateSettlements, calculatePairwiseSettlements } from '../../utils/balances'
import { getPayments, recordPayment } from '../../services/db'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const SECTION_LABEL = 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block'

export default function SettleUpModal({ groupId, expenses, members, currentUid, onReopen, onClose }) {
  const [simplified, setSimplified] = useState(false)
  const [payments, setPayments] = useState([])
  const [recording, setRecording] = useState(null) // settlement key being recorded
  const [reopening, setReopening] = useState(false)

  useEffect(() => {
    getPayments(groupId).then(setPayments)
  }, [groupId])

  const balances = calculateBalances(expenses, payments)
  const settlements = simplified
    ? calculateSettlements(balances, members)
    : calculatePairwiseSettlements(expenses, members, payments)

  async function handleRecord(s) {
    const key = `${s.from}|${s.to}`
    setRecording(key)
    try {
      const id = await recordPayment(groupId, { from: s.from, to: s.to, amount: s.amount })
      setPayments((prev) => [...prev, { id, from: s.from, to: s.to, amount: s.amount }])
    } finally {
      setRecording(null)
    }
  }

  async function handleReopen() {
    setReopening(true)
    await onReopen()
    setReopening(false)
    onClose()
  }

  return (
    <Modal title="Settle up" onClose={onClose} size="lg">
      <div className="p-5 space-y-6">

        {/* Balances */}
        <div>
          <h3 className={SECTION_LABEL}>Balances</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.keys(members).map((uid) => {
              const balance = balances[uid] ?? 0
              const name = members[uid]?.displayName ?? members[uid]?.email ?? uid
              const isYou = uid === currentUid
              return (
                <div key={uid} className={clsx(
                  'rounded-2xl px-4 py-3.5 border',
                  isYou ? 'border-green-800/60 bg-green-950/30' : 'border-slate-800 bg-slate-800/60'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={name} uid={uid} size="sm" />
                    <span className="text-sm text-slate-300 truncate">{isYou ? 'You' : name}</span>
                  </div>
                  <p className={clsx(
                    'text-xl font-bold tabular-nums',
                    balance > 0.005 ? 'text-green-400' : balance < -0.005 ? 'text-red-400' : 'text-slate-500'
                  )}>
                    {balance > 0.005 ? '+' : ''}{fmt(Math.abs(balance) < 0.005 ? 0 : balance)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {balance > 0.005 ? 'is owed' : balance < -0.005 ? 'owes' : 'settled up'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Who pays whom */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={SECTION_LABEL} style={{ marginBottom: 0 }}>Who pays whom</h3>
            <div className="flex gap-0.5 bg-slate-800 rounded-lg p-0.5">
              {[
                { id: false, label: 'Individual' },
                { id: true,  label: 'Simplified' },
              ].map((opt) => (
                <button
                  key={String(opt.id)}
                  type="button"
                  onClick={() => setSimplified(opt.id)}
                  className={clsx(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    simplified === opt.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {settlements.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 text-green-400">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Everyone is settled up!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {settlements.map((s, i) => {
                const key = `${s.from}|${s.to}`
                const isRecording = recording === key
                return (
                  <div key={i} className="flex items-center gap-2 bg-slate-800/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm">
                    <Avatar name={members[s.from]?.displayName ?? s.fromName} uid={s.from} size="sm" />
                    <span className={clsx('font-medium', s.from === currentUid ? 'text-green-300' : 'text-white')}>
                      {s.from === currentUid ? 'You' : s.fromName}
                    </span>
                    <ArrowRight size={13} className="text-slate-500 shrink-0" />
                    <Avatar name={members[s.to]?.displayName ?? s.toName} uid={s.to} size="sm" />
                    <span className={clsx('font-medium', s.to === currentUid ? 'text-green-300' : 'text-white')}>
                      {s.to === currentUid ? 'you' : s.toName}
                    </span>
                    <span className="ml-auto font-semibold text-green-400 tabular-nums mr-3">{fmt(s.amount)}</span>
                    <button
                      onClick={() => handleRecord(s)}
                      disabled={isRecording}
                      className="shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-green-700 hover:text-green-400 hover:bg-green-950/40 transition-colors disabled:opacity-40"
                    >
                      {isRecording ? '…' : 'Record payment'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Reopen */}
        <div className="pt-1 border-t border-slate-800">
          <Button variant="ghost" onClick={handleReopen} disabled={reopening} className="w-full text-slate-400 hover:text-white">
            <RotateCcw size={14} />
            {reopening ? 'Reopening…' : 'Reopen trip'}
          </Button>
        </div>

      </div>
    </Modal>
  )
}
