import clsx from 'clsx'
import { Calendar, CreditCard, UserPlus, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
function fmtDateLong(iso) {
  return iso
    ? new Date(iso).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'
}

const SPLIT_LABEL = { equal: 'Equal split', exact: 'Exact amounts', percent: 'By percentage' }

export default function ExpenseDetailModal({ expense, members, onClose }) {
  const user = useAuth()
  const { description, amount, paidBy, paidByName, addedBy, addedByName, splitType, splits = {}, date } = expense

  const payerProfile = members[paidBy]
  const payerName = payerProfile?.displayName ?? paidByName ?? paidBy
  const adderProfile = members[addedBy]
  const adderName = adderProfile?.displayName ?? addedByName ?? addedBy
  const splitEntries = Object.entries(splits).sort(([a], [b]) => {
    if (a === paidBy) return -1
    if (b === paidBy) return 1
    return 0
  })
  const totalSplit = splitEntries.reduce((s, [, v]) => s + v, 0)

  return (
    <Modal title="Expense details" onClose={onClose}>
      <div className="p-5 space-y-5">

        {/* Description + amount */}
        <div className="text-center py-2">
          <p className="text-2xl font-bold text-white tabular-nums">{fmt(amount)}</p>
          <p className="text-slate-400 mt-1">{description}</p>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Meta rows */}
        <div className="space-y-3">
          {/* Paid by */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 shrink-0">
              <CreditCard size={14} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Paid by</p>
              <div className="flex items-center gap-2">
                <Avatar name={payerName} uid={paidBy} size="xs" />
                <span className="text-sm font-medium text-white">
                  {paidBy === user?.uid ? 'You' : payerName}
                </span>
              </div>
            </div>
          </div>

          {/* Added by */}
          {addedBy && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 shrink-0">
                <UserPlus size={14} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Added by</p>
                <div className="flex items-center gap-2">
                  <Avatar name={adderName} uid={addedBy} size="xs" />
                  <span className="text-sm font-medium text-white">
                    {addedBy === user?.uid ? 'You' : adderName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 shrink-0">
              <Calendar size={14} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Date</p>
              <p className="text-sm font-medium text-white">{fmtDateLong(date)}</p>
            </div>
          </div>

          {/* Split type */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 shrink-0">
              <Users size={14} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Split method</p>
              <p className="text-sm font-medium text-white">{SPLIT_LABEL[splitType] ?? splitType}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Per-member shares */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Shares</p>
          <div className="space-y-2">
            {splitEntries.map(([uid, share]) => {
              const profile = members[uid]
              const name = profile?.displayName ?? uid
              const isPayer = uid === paidBy
              const isYou = uid === user?.uid
              const pct = totalSplit > 0 ? (share / totalSplit) * 100 : 0

              return (
                <div key={uid} className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-3 py-2.5">
                  <Avatar name={name} uid={uid} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-white font-medium truncate">
                        {isYou ? 'You' : name}
                      </span>
                      {isPayer && (
                        <span className="text-[10px] font-medium text-green-400 bg-green-950/60 border border-green-800/50 rounded-md px-1.5 py-0.5 leading-none shrink-0">
                          paid
                        </span>
                      )}
                    </div>
                    {/* Share bar */}
                    <div className="mt-1.5 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full', isPayer ? 'bg-green-500' : 'bg-slate-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={clsx(
                      'text-sm font-semibold tabular-nums',
                      isYou && isPayer ? 'text-green-400' : isYou ? 'text-orange-400' : 'text-white'
                    )}>
                      {fmt(share)}
                    </p>
                    <p className="text-[10px] text-slate-500">{pct.toFixed(0)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </Modal>
  )
}
