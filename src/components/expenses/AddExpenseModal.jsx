import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { ChevronDown, Search, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { addExpense, updateExpense } from '../../services/db'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import LoadingSpinner from '../ui/LoadingSpinner'

const SPLIT_TYPES = [
  { id: 'equal',   label: 'Equal'   },
  { id: 'exact',   label: 'Exact'   },
  { id: 'percent', label: 'Percent' },
]

const INPUT_CLS =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-sm'

export default function AddExpenseModal({ groupId, members, expense, onClose }) {
  const user = useAuth()
  const toast = useToast()
  const memberList = Object.entries(members)
  const isEditing = Boolean(expense)

  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [paidBy, setPaidBy] = useState(expense?.paidBy ?? user?.uid ?? memberList[0]?.[0] ?? '')
  const [paidByOpen, setPaidByOpen] = useState(false)
  const [paidBySearch, setPaidBySearch] = useState('')
  const [splitType, setSplitType] = useState(expense?.splitType ?? 'equal')
  const [splitWith, setSplitWith] = useState(() =>
    new Set(expense ? Object.keys(expense.splits ?? {}) : memberList.map(([uid]) => uid))
  )
  const [exactAmounts, setExactAmounts] = useState({})
  const [percentages, setPercentages] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const paidByRef = useRef(null)
  useEffect(() => {
    function handleClickOutside(e) {
      if (paidByRef.current && !paidByRef.current.contains(e.target)) {
        setPaidByOpen(false)
        setPaidBySearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const parsedAmount = parseFloat(amount) || 0
  const splitMembers = memberList.filter(([uid]) => splitWith.has(uid))

  useEffect(() => {
    const blank = Object.fromEntries(memberList.map(([uid]) => [uid, '']))
    if (expense?.splits) {
      const seededAmounts = { ...blank }
      const seededPercents = { ...blank }
      for (const [uid, share] of Object.entries(expense.splits)) {
        seededAmounts[uid] = String(share)
        seededPercents[uid] = expense.amount > 0 ? String((share / expense.amount) * 100) : ''
      }
      setExactAmounts(seededAmounts)
      setPercentages(seededPercents)
    } else {
      setExactAmounts(blank)
      setPercentages(blank)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSplitWith(uid) {
    setSplitWith((prev) => {
      if (prev.has(uid) && prev.size <= 1) return prev
      const next = new Set(prev)
      next.has(uid) ? next.delete(uid) : next.add(uid)
      return next
    })
  }

  function computeSplits() {
    if (splitType === 'equal') {
      const share = parsedAmount / splitMembers.length
      return Object.fromEntries(splitMembers.map(([uid]) => [uid, share]))
    }
    if (splitType === 'exact') {
      return Object.fromEntries(splitMembers.map(([uid]) => [uid, parseFloat(exactAmounts[uid]) || 0]))
    }
    return Object.fromEntries(
      splitMembers.map(([uid]) => [uid, (parsedAmount * (parseFloat(percentages[uid]) || 0)) / 100])
    )
  }

  function validate() {
    if (!description.trim()) return 'Description is required.'
    if (!parsedAmount || parsedAmount <= 0) return 'Enter a valid amount.'
    if (splitType === 'exact') {
      const sum = splitMembers.reduce((s, [uid]) => s + (parseFloat(exactAmounts[uid]) || 0), 0)
      if (Math.abs(sum - parsedAmount) > 0.01)
        return `Amounts must sum to $${parsedAmount.toFixed(2)} — currently $${sum.toFixed(2)}.`
    }
    if (splitType === 'percent') {
      const sum = splitMembers.reduce((s, [uid]) => s + (parseFloat(percentages[uid]) || 0), 0)
      if (Math.abs(sum - 100) > 0.01)
        return `Percentages must sum to 100% — currently ${sum.toFixed(1)}%.`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const payload = {
        description: description.trim(),
        amount: parsedAmount,
        paidBy,
        paidByName: members[paidBy]?.displayName ?? paidBy,
        splitType,
        splits: computeSplits(),
      }
      if (isEditing) {
        await updateExpense(groupId, expense.id, payload, expense.amount)
        toast('Expense updated!', 'success')
      } else {
        await addExpense(groupId, {
          ...payload,
          addedBy: user.uid,
          addedByName: members[user.uid]?.displayName ?? user.displayName ?? user.email,
          date: new Date().toISOString(),
        })
        toast('Expense added!', 'success')
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast('Failed to save expense. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const equalShare = splitMembers.length ? parsedAmount / splitMembers.length : 0
  const exactSum   = splitMembers.reduce((s, [uid]) => s + (parseFloat(exactAmounts[uid]) || 0), 0)
  const percentSum = splitMembers.reduce((s, [uid]) => s + (parseFloat(percentages[uid])  || 0), 0)

  return (
    <Modal title={isEditing ? 'Edit expense' : 'Add expense'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            autoFocus required className={INPUT_CLS} placeholder="Dinner, Airbnb, Groceries…" />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              required min="0.01" step="0.01" className={`${INPUT_CLS} pl-8`} placeholder="0.00" />
          </div>
        </div>

        {/* Paid by */}
        <div ref={paidByRef}>
          <label className="block text-sm text-slate-300 mb-1.5">Paid by</label>

          {/* Trigger button */}
          <button
            type="button"
            onClick={() => { setPaidByOpen((v) => !v); setPaidBySearch('') }}
            className="w-full flex items-center gap-2.5 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-left hover:border-slate-600 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
          >
            {(() => {
              const profile = members[paidBy]
              const name = profile?.displayName ?? profile?.email ?? paidBy
              return (
                <>
                  <Avatar name={name} uid={paidBy} size="xs" />
                  <span className="flex-1 text-white">{paidBy === user?.uid ? 'You' : name}</span>
                </>
              )
            })()}
            <ChevronDown size={14} className={clsx('text-slate-400 transition-transform shrink-0', paidByOpen && 'rotate-180')} />
          </button>

          {/* Inline panel */}
          {paidByOpen && (
            <div className="mt-1.5 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700">
                <Search size={13} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={paidBySearch}
                  onChange={(e) => setPaidBySearch(e.target.value)}
                  placeholder="Search member…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Member list */}
              <div className="max-h-44 overflow-y-auto overscroll-contain">
                {memberList
                  .filter(([uid, profile]) => {
                    const name = profile.displayName ?? profile.email ?? uid
                    return name.toLowerCase().includes(paidBySearch.toLowerCase())
                  })
                  .map(([uid, profile]) => {
                    const name = profile.displayName ?? profile.email ?? uid
                    const isSelected = paidBy === uid
                    return (
                      <button
                        key={uid}
                        type="button"
                        onClick={() => { setPaidBy(uid); setPaidByOpen(false); setPaidBySearch('') }}
                        className={clsx(
                          'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left',
                          isSelected
                            ? 'bg-green-950/60 text-green-300'
                            : 'text-slate-300 hover:bg-slate-700/60'
                        )}
                      >
                        <Avatar name={name} uid={uid} size="xs" />
                        <span className="flex-1 truncate">{uid === user?.uid ? 'You' : name}</span>
                        {isSelected && <Check size={13} className="text-green-400 shrink-0" />}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Split with */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm text-slate-300">Split with</label>
            {splitWith.size < memberList.length && (
              <button
                type="button"
                onClick={() => setSplitWith(new Set(memberList.map(([uid]) => uid)))}
                className="text-xs text-green-500 hover:text-green-400 transition-colors"
              >
                Select all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {memberList.map(([uid, profile]) => {
              const name = profile.displayName ?? profile.email ?? uid
              const selected = splitWith.has(uid)
              return (
                <button key={uid} type="button" onClick={() => toggleSplitWith(uid)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-colors',
                    selected
                      ? 'border-green-600 bg-green-950/60 text-green-300'
                      : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                  )}>
                  <Avatar name={name} uid={uid} size="xs" />
                  {uid === user?.uid ? 'You' : name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Split type */}
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Split</label>
          <div className="flex gap-1.5 bg-slate-800 rounded-xl p-1">
            {SPLIT_TYPES.map((t) => (
              <button key={t.id} type="button" onClick={() => setSplitType(t.id)}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  splitType === t.id ? 'bg-green-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                )}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Equal preview */}
        {splitType === 'equal' && parsedAmount > 0 && (
          <div className="space-y-1.5">
            {splitMembers.map(([uid, profile]) => {
              const name = profile.displayName ?? profile.email ?? uid
              return (
                <div key={uid} className="flex items-center justify-between text-sm bg-slate-800/60 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={name} uid={uid} size="sm" />
                    <span className="text-slate-300">{uid === user?.uid ? 'You' : name}</span>
                  </div>
                  <span className="font-medium text-white">${equalShare.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Exact inputs */}
        {splitType === 'exact' && (
          <div className="space-y-2">
            {splitMembers.map(([uid, profile]) => {
              const name = profile.displayName ?? profile.email ?? uid
              return (
                <div key={uid} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar name={name} uid={uid} size="sm" />
                    <span className="text-sm text-slate-300 truncate">{uid === user?.uid ? 'You' : name}</span>
                  </div>
                  <div className="relative w-28 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={exactAmounts[uid] ?? ''}
                      onChange={(e) => setExactAmounts((p) => ({ ...p, [uid]: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-green-600 transition-colors"
                      placeholder="0.00" />
                  </div>
                </div>
              )
            })}
            {parsedAmount > 0 && (
              <p className={clsx('text-xs text-right font-medium', Math.abs(exactSum - parsedAmount) < 0.01 ? 'text-green-400' : 'text-amber-400')}>
                ${exactSum.toFixed(2)} / ${parsedAmount.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Percent inputs */}
        {splitType === 'percent' && (
          <div className="space-y-2">
            {splitMembers.map(([uid, profile]) => {
              const name = profile.displayName ?? profile.email ?? uid
              return (
                <div key={uid} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar name={name} uid={uid} size="sm" />
                    <span className="text-sm text-slate-300 truncate">{uid === user?.uid ? 'You' : name}</span>
                  </div>
                  <div className="relative w-28 shrink-0">
                    <input type="number" min="0" max="100" step="0.1" value={percentages[uid] ?? ''}
                      onChange={(e) => setPercentages((p) => ({ ...p, [uid]: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-7 py-2 text-white text-sm focus:outline-none focus:border-green-600 transition-colors"
                      placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>
              )
            })}
            <p className={clsx('text-xs text-right font-medium', Math.abs(percentSum - 100) < 0.01 ? 'text-green-400' : 'text-amber-400')}>
              {percentSum.toFixed(1)}% of 100%
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add expense'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
