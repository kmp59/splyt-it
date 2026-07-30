import { useState, useEffect } from 'react'
import clsx from 'clsx'
import confetti from 'canvas-confetti'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { calculateBalances, calculateSettlements, calculatePairwiseSettlements } from '../../utils/balances'
import { getPayments, recordPayment } from '../../services/db'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const SECTION_LABEL = 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block'

export default function SettleUpModal({ groupId, expenses, members, currentUid, onArchive, archiving, onClose }) {
  const [simplified, setSimplified] = useState(true)
  const [payments, setPayments] = useState([])
  const [recording, setRecording] = useState(null) // settlement key being recorded
  const [paidRecords, setPaidRecords] = useState([]) // settlements recorded this session, kept visible

  useEffect(() => {
    getPayments(groupId).then(setPayments)
  }, [groupId])

  const balances = calculateBalances(expenses, payments)
  const settlements = simplified
    ? calculateSettlements(balances, members)
    : calculatePairwiseSettlements(expenses, members, payments)
  const allSettled = Object.keys(members).length > 0
    && Object.keys(members).every((uid) => Math.abs(balances[uid] ?? 0) < 0.005)

  async function handleRecord(s) {
    const key = `${s.from}|${s.to}`
    setRecording(key)
    try {
      const id = await recordPayment(groupId, { from: s.from, to: s.to, amount: s.amount })
      setPayments((prev) => [...prev, { id, from: s.from, to: s.to, amount: s.amount }])
      setPaidRecords((prev) => [...prev, { ...s, key }])
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } finally {
      setRecording(null)
    }
  }

  return (
    <Modal title="Settle up" onClose={onClose} size="lg">
      <div className="p-5 space-y-6">

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

          {(() => {
            const liveKeys = new Set(settlements.map((s) => `${s.from}|${s.to}`))
            const paidRows = paidRecords.filter((p) => !liveKeys.has(p.key))
            const rows = [...settlements.map((s) => ({ ...s, key: `${s.from}|${s.to}`, paid: false })), ...paidRows.map((p) => ({ ...p, paid: true }))]

            if (rows.length === 0) {
              return (
                <div className="flex items-center justify-center gap-2 py-4 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Everyone is settled up!</span>
                </div>
              )
            }

            return (
              <div className="space-y-2">
                {rows.map((s) => {
                  const isRecording = recording === s.key
                  return (
                    <div
                      key={s.key}
                      className={clsx(
                        'flex items-center gap-2 border rounded-2xl px-4 py-3 text-sm',
                        s.paid ? 'bg-green-950/20 border-green-800/40' : 'bg-slate-800/60 border-slate-800'
                      )}
                    >
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
                      {s.paid ? (
                        <button
                          disabled
                          className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-green-700/60 bg-green-950/40 text-green-400 cursor-default"
                        >
                          <CheckCircle size={13} />
                          Paid
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRecord(s)}
                          disabled={isRecording}
                          className="shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-green-700 hover:text-green-400 hover:bg-green-950/40 transition-colors disabled:opacity-40"
                        >
                          {isRecording ? '…' : 'Record payment'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>

        {/* Archive — only once everyone is settled up */}
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
