import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Pencil, Receipt, TrendingUp, Scale, UserPlus, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { subscribeToGroup, subscribeToExpenses, getGroupMembers, deleteExpense, addMemberToGroup, addGuestToGroup, completeGroup, archiveGroup, reopenGroup, getPayments } from '../services/db'
import { calculateBalances } from '../utils/balances'
import NavBar from '../components/ui/NavBar'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { FullPageSpinner } from '../components/ui/LoadingSpinner'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import ExpenseDetailModal from '../components/expenses/ExpenseDetailModal'
import SettleUpModal from '../components/groups/SettleUpModal'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
}

const SECTION_LABEL = 'text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block'

export default function GroupPage() {
  const { groupId } = useParams()
  const user = useAuth()
  const toast = useToast()

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [members, setMembers] = useState({})
  const [payments, setPayments] = useState([])
  const [groupLoading, setGroupLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [tab, setTab] = useState('expenses')
  const [addMemberEmail, setAddMemberEmail] = useState('')
  const [addMemberName, setAddMemberName] = useState('')
  const [addMemberMode, setAddMemberMode] = useState('email')
  const [addingMember, setAddingMember] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [showSettleUp, setShowSettleUp] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [archiving, setArchiving] = useState(false)

  // real-time group doc
  useEffect(() => {
    return subscribeToGroup(
      groupId,
      (g) => { setGroup(g); setGroupLoading(false) },
      () => { toast('Failed to load group.', 'error'); setGroupLoading(false) }
    )
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  // fetch member + pending-invitee profiles when either list changes
  const allProfileIds = [...(group?.memberIds ?? []), ...(group?.pendingMemberIds ?? [])]
  useEffect(() => {
    if (!allProfileIds.length) return
    getGroupMembers(allProfileIds).then(setMembers)
  }, [allProfileIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  // real-time expenses
  useEffect(() => {
    return subscribeToExpenses(
      groupId,
      setExpenses,
      () => toast('Failed to load expenses.', 'error')
    )
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  function refreshPayments() {
    getPayments(groupId).then(setPayments)
  }

  useEffect(() => {
    refreshPayments()
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddMember(e) {
    e.preventDefault()
    const email = addMemberEmail.trim()
    if (!email) return
    setAddingMember(true)
    try {
      await addMemberToGroup(groupId, email)
      toast(`${email} invited — they'll join once they accept.`, 'success')
      setAddMemberEmail('')
      setShowAddMember(false)
    } catch (err) {
      toast(
        err.code === 'user/not-found'
          ? 'No account found for that email.'
          : 'Failed to add member.',
        'error'
      )
    } finally {
      setAddingMember(false)
    }
  }

  async function handleAddGuest(e) {
    e.preventDefault()
    const name = addMemberName.trim()
    if (!name) return
    setAddingMember(true)
    try {
      await addGuestToGroup(groupId, name)
      toast(`${name} added as a guest.`, 'success')
      setAddMemberName('')
      setShowAddMember(false)
    } catch {
      toast('Failed to add guest.', 'error')
    } finally {
      setAddingMember(false)
    }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      await completeGroup(groupId)
    } catch {
      toast('Failed to complete trip.', 'error')
    } finally {
      setCompleting(false)
    }
  }

  async function handleArchive() {
    if (!confirm('Archive this group for everyone?')) return
    setArchiving(true)
    try {
      await archiveGroup(groupId)
      toast('Group archived.', 'success')
    } catch {
      toast('Failed to archive group.', 'error')
    } finally {
      setArchiving(false)
    }
  }

  async function handleReopen() {
    await reopenGroup(groupId)
    setShowSettleUp(false)
  }

  async function handleDelete(expense) {
    if (!confirm(`Delete "${expense.description}"?`)) return
    setDeletingId(expense.id)
    try {
      await deleteExpense(groupId, expense.id, expense.amount)
      toast('Expense deleted.', 'success')
    } catch {
      toast('Failed to delete expense.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (groupLoading) return <FullPageSpinner />
  if (!group) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Group not found.
      </div>
    )
  }

  const balances = calculateBalances(expenses, payments)
  const memberList = group.memberIds ?? []
  const pendingList = group.pendingMemberIds ?? []
  const hasExpenses = expenses.length > 0
  const myBalance = balances[user?.uid] ?? 0

  const navLeft = (
    <div className="flex items-center gap-2 min-w-0">
      <Link
        to="/dashboard"
        className="w-11 h-11 -ml-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <ArrowLeft size={16} />
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white text-sm leading-tight truncate">{group.name}</p>
          {group.archived ? (
            <span className="text-[10px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-md px-1.5 py-0.5 leading-none shrink-0">archived</span>
          ) : group.completed && (
            <span className="text-[10px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/50 rounded-md px-1.5 py-0.5 leading-none shrink-0">settling up</span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 truncate">ID: {group.id}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar left={navLeft} />

      {/* Tab bar: Expenses (default), Spending, Balances */}
      <div className="border-b border-slate-800 bg-slate-950 sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4 flex">
          {[
            { id: 'expenses', label: 'Expenses', icon: Receipt },
            { id: 'spending', label: 'Spending', icon: TrendingUp },
            { id: 'balances', label: 'Balances', icon: Scale },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-inset',
                tab === id
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          {group.archived ? (
            <Button variant="secondary" onClick={handleReopen}>
              <RotateCcw size={14} />
              Reopen trip
            </Button>
          ) : group.completed ? (
            <>
              <Button onClick={() => setShowSettleUp(true)}>
                Settle up
              </Button>
              <Button variant="secondary" onClick={() => setShowAddExpense(true)}>
                <Plus size={15} />
                Add expense
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleComplete} disabled={completing || !hasExpenses}>
                {completing ? 'Completing…' : 'Complete trip'}
              </Button>
              <Button onClick={() => setShowAddExpense(true)}>
                <Plus size={15} />
                Add expense
              </Button>
            </>
          )}
        </div>

        {/* Members — always visible regardless of tab */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className={SECTION_LABEL} style={{ marginBottom: 0 }}>Members · {memberList.length}</h2>
            <button
              onClick={() => setShowAddMember((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-400 transition-colors"
            >
              <UserPlus size={13} />
              Add member
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {memberList.map((uid) => {
              const profile = members[uid]
              const name = profile?.displayName ?? profile?.email ?? uid
              return (
                <div key={uid} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                  <Avatar name={name} uid={uid} size="sm" />
                  <span className="text-sm text-slate-300">{uid === user?.uid ? 'You' : name}</span>
                  {profile?.isGuest && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-800 border border-slate-700 rounded-md px-1.5 py-0.5 leading-none">guest</span>
                  )}
                </div>
              )
            })}
          </div>

          {pendingList.length > 0 && (
            <div className="mt-3">
              <span className="text-[11px] text-slate-500 uppercase tracking-wide">Pending invites</span>
              <div className="flex flex-wrap gap-2.5 mt-1.5">
                {pendingList.map((uid) => {
                  const profile = members[uid]
                  const name = profile?.displayName ?? profile?.email ?? uid
                  return (
                    <div key={uid} className="flex items-center gap-2 bg-slate-900/50 border border-dashed border-slate-700 rounded-xl px-3 py-2 opacity-70">
                      <Avatar name={name} uid={uid} size="sm" />
                      <span className="text-sm text-slate-400">{name}</span>
                      <span className="text-[10px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/50 rounded-md px-1.5 py-0.5 leading-none">invited</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {showAddMember && (
            <div className="mt-3 space-y-2">
              {/* Mode toggle */}
              <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5 w-fit">
                {[{ id: 'email', label: 'By email' }, { id: 'guest', label: 'Guest (no account)' }].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAddMemberMode(m.id)}
                    className={clsx(
                      'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                      addMemberMode === m.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {addMemberMode === 'email' ? (
                <form onSubmit={handleAddMember} className="flex gap-2">
                  <input
                    type="email"
                    value={addMemberEmail}
                    onChange={(e) => setAddMemberEmail(e.target.value)}
                    autoFocus
                    required
                    placeholder="Email address…"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                  />
                  <Button type="submit" size="sm" disabled={addingMember || !addMemberEmail.trim()}>
                    {addingMember ? 'Adding…' : 'Add'}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setShowAddMember(false); setAddMemberEmail('') }}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleAddGuest} className="flex gap-2">
                  <input
                    type="text"
                    value={addMemberName}
                    onChange={(e) => setAddMemberName(e.target.value)}
                    autoFocus
                    required
                    placeholder="Display name…"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                  />
                  <Button type="submit" size="sm" disabled={addingMember || !addMemberName.trim()}>
                    {addingMember ? 'Adding…' : 'Add'}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setShowAddMember(false); setAddMemberName('') }}>
                    Cancel
                  </Button>
                </form>
              )}
            </div>
          )}
        </section>

        {/* Expenses list — default tab */}
        <section className={clsx(tab !== 'expenses' && 'hidden')}>
          <h2 className={SECTION_LABEL}>
            Expenses
            {hasExpenses && (
              <span className="ml-2 text-slate-500 font-normal normal-case tracking-normal">
                · {fmt(group.totalExpenses ?? 0)} total
              </span>
            )}
          </h2>

          {expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Add the first expense to start tracking who owes what."
              action={
                <Button onClick={() => setShowAddExpense(true)}>
                  <Plus size={15} />
                  Add expense
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => {
                const payerName = members[exp.paidBy]?.displayName ?? exp.paidByName ?? ''
                const payerLabel = exp.paidBy === user?.uid ? 'You' : payerName
                const adderName = members[exp.addedBy]?.displayName ?? exp.addedByName ?? ''
                const adderLabel = exp.addedBy === user?.uid ? 'You' : adderName
                const showAddedBy = exp.addedBy && exp.addedBy !== exp.paidBy
                const userShare = exp.splits?.[user?.uid] ?? 0
                const userIsPayer = exp.paidBy === user?.uid
                const netLent = userIsPayer ? exp.amount - userShare : 0
                return (
                  <div
                    key={exp.id}
                    onClick={() => setSelectedExpense(exp)}
                    className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 cursor-pointer hover:border-slate-700 hover:bg-slate-800/60 transition-colors"
                  >
                    <Avatar name={payerName} uid={exp.paidBy} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{exp.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {payerLabel} paid {fmt(exp.amount)} · {fmtDate(exp.date)}
                        {showAddedBy && ` · added by ${adderLabel}`}
                      </p>
                    </div>
                    {userIsPayer && netLent > 0.005 ? (
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-green-400 tabular-nums text-sm">+{fmt(netLent)}</p>
                        <p className="text-[11px] text-green-600">you lent</p>
                      </div>
                    ) : !userIsPayer && userShare > 0.005 ? (
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-orange-400 tabular-nums text-sm">{fmt(userShare)}</p>
                        <p className="text-[11px] text-orange-700">your share</p>
                      </div>
                    ) : (
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-slate-500 tabular-nums text-sm">{fmt(exp.amount)}</p>
                        <p className="text-[11px] text-slate-600">not involved</p>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingExpense(exp) }}
                      className="w-11 h-11 -my-2 flex items-center justify-center rounded-lg text-slate-600 hover:text-green-400 hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                      title="Edit expense"
                    >
                      <Pencil size={14} />
                    </button>
                    {exp.paidBy === user?.uid && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(exp) }}
                        disabled={deletingId === exp.id}
                        className="w-11 h-11 -my-2 -mr-2 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors disabled:opacity-30 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Spending — per-member totals */}
        <section className={clsx(tab !== 'spending' && 'hidden')}>
          <h2 className={SECTION_LABEL}>Spending</h2>
          {!hasExpenses ? (
            <EmptyState
              icon={TrendingUp}
              title="No spending yet"
              description="Once expenses are added, you'll see who paid for what here."
            />
          ) : (() => {
            const spending = {}
            for (const exp of expenses) {
              spending[exp.paidBy] = (spending[exp.paidBy] ?? 0) + exp.amount
            }
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
                {[...memberList]
                  .sort((a, b) => (spending[b] ?? 0) - (spending[a] ?? 0))
                  .map((uid, i) => {
                    const spent = spending[uid] ?? 0
                    const name = members[uid]?.displayName ?? members[uid]?.email ?? uid
                    const isYou = uid === user?.uid
                    return (
                      <div key={uid} className={clsx(
                        'flex items-center gap-3 px-4 py-3',
                        isYou && 'bg-green-950/20'
                      )}>
                        <span className="text-xs text-slate-600 w-4 shrink-0 tabular-nums">{i + 1}</span>
                        <Avatar name={name} uid={uid} size="sm" />
                        <span className="flex-1 text-sm text-slate-300 truncate">{isYou ? 'You' : name}</span>
                        <span className={clsx('text-sm font-semibold tabular-nums shrink-0', isYou ? 'text-green-400' : 'text-white')}>
                          {fmt(spent)}
                        </span>
                      </div>
                    )
                  })}
              </div>
            )
          })()}
        </section>

        {/* Balances — who owes whom */}
        <section className={clsx(tab !== 'balances' && 'hidden')}>
          <h2 className={SECTION_LABEL}>Balances</h2>
          {!hasExpenses ? (
            <EmptyState
              icon={Scale}
              title="No balances yet"
              description="Add an expense and balances will appear here."
            />
          ) : (
            <>
              <div className={clsx(
                'rounded-2xl border px-4 py-3.5 mb-3 flex items-center justify-between',
                myBalance > 0.005 ? 'border-green-800/60 bg-green-950/20' :
                myBalance < -0.005 ? 'border-orange-800/60 bg-orange-950/20' :
                'border-slate-800 bg-slate-900'
              )}>
                <p className="text-sm text-slate-300">
                  {myBalance > 0.005 ? "You're owed" : myBalance < -0.005 ? 'You owe' : "You're settled up"}
                </p>
                {Math.abs(myBalance) > 0.005 && (
                  <p className={clsx(
                    'font-bold tabular-nums',
                    myBalance > 0.005 ? 'text-green-400' : 'text-orange-400'
                  )}>
                    {fmt(Math.abs(myBalance))}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                {memberList.map((uid) => {
                  const balance = balances[uid] ?? 0
                  const name = members[uid]?.displayName ?? members[uid]?.email ?? uid
                  const isYou = uid === user?.uid
                  return (
                    <div key={uid} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Avatar name={name} uid={uid} size="xs" />
                        <span className="text-xs text-slate-400 truncate">{isYou ? 'You' : name}</span>
                      </div>
                      <p className={clsx(
                        'text-sm font-semibold tabular-nums',
                        balance > 0.005 ? 'text-green-400' : balance < -0.005 ? 'text-orange-400' : 'text-slate-500'
                      )}>
                        {balance > 0.005 ? '+' : ''}{fmt(Math.abs(balance) < 0.005 ? 0 : balance)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {showAddExpense && Object.keys(members).length > 0 && (
        <AddExpenseModal
          groupId={groupId}
          members={members}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {editingExpense && Object.keys(members).length > 0 && (
        <AddExpenseModal
          groupId={groupId}
          members={members}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}

      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          members={members}
          onClose={() => setSelectedExpense(null)}
        />
      )}

      {showSettleUp && !group.archived && (
        <SettleUpModal
          groupId={groupId}
          expenses={expenses}
          members={members}
          currentUid={user?.uid}
          onArchive={handleArchive}
          archiving={archiving}
          onClose={() => { setShowSettleUp(false); refreshPayments() }}
        />
      )}
    </div>
  )
}
