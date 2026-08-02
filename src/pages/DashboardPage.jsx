import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Plus, Hash, ChevronRight, Archive, Mail, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { subscribeToUserGroups, subscribeToPendingInvites, joinGroup, acceptInvite, declineInvite } from '../services/db'
import NavBar from '../components/ui/NavBar'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import CreateGroupModal from '../components/groups/CreateGroupModal'

function GroupCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-700 rounded w-2/5" />
          <div className="h-3 bg-slate-800 rounded w-1/4" />
        </div>
        <div className="h-4 bg-slate-800 rounded w-14" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [groups, setGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [invites, setInvites] = useState([])
  const [respondingId, setRespondingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeToUserGroups(
      user.uid,
      (docs) => {
        setGroups(docs)
        setGroupsLoading(false)
      },
      () => {
        toast('Failed to load groups.', 'error')
        setGroupsLoading(false)
      }
    )
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    return subscribeToPendingInvites(user.uid, setInvites, () => toast('Failed to load invites.', 'error'))
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAccept(groupId) {
    setRespondingId(groupId)
    try {
      await acceptInvite(groupId, user.uid)
      navigate(`/groups/${groupId}`)
    } catch {
      toast('Failed to accept invite.', 'error')
    } finally {
      setRespondingId(null)
    }
  }

  async function handleDecline(groupId) {
    setRespondingId(groupId)
    try {
      await declineInvite(groupId, user.uid)
    } catch {
      toast('Failed to decline invite.', 'error')
    } finally {
      setRespondingId(null)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    const id = joinId.trim()
    if (!id) return
    setJoining(true)
    try {
      await joinGroup(id, user.uid)
      setJoinId('')
      navigate(`/groups/${id}`)
    } catch {
      toast('Group not found or could not be joined.', 'error')
    } finally {
      setJoining(false)
    }
  }

  const firstName = (user?.displayName || user?.email?.split('@')[0] || 'there').split(' ')[0]

  const activeGroups = groups.filter((g) => !g.archived)
  const archivedGroups = groups.filter((g) => g.archived)

  function renderGroupRow(g) {
    return (
      <Link
        key={g.id}
        to={`/groups/${g.id}`}
        className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 rounded-2xl px-4 py-3.5 transition-colors group"
      >
        <Avatar name={g.name} uid={g.id} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate group-hover:text-green-300 transition-colors">
              {g.name}
            </p>
            {g.completed && !g.archived && (
              <span className="text-[10px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/50 rounded-md px-1.5 py-0.5 leading-none shrink-0">settling up</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {g.memberIds?.length ?? 1}{' '}
            {g.memberIds?.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm text-white">
            ${(g.totalExpenses ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">total</p>
        </div>
        <ChevronRight size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 py-7 space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Hey, {firstName} 👋</h1>
            <p className="text-slate-400 text-sm mt-0.5">Your groups</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={15} />
            New group
          </Button>
        </div>

        {invites.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Mail size={12} />
              Invites
            </p>
            <div className="space-y-2">
              {invites.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5"
                >
                  <Avatar name={g.name} uid={g.id} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{g.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">You've been invited to join</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={respondingId === g.id}
                    onClick={() => handleAccept(g.id)}
                  >
                    <Check size={13} />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={respondingId === g.id}
                    onClick={() => handleDecline(g.id)}
                  >
                    <X size={13} />
                    Decline
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Hash size={12} />
            Join a group by ID
          </p>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
              placeholder="Paste group ID…"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={joining || !joinId.trim()}
            >
              {joining ? 'Joining…' : 'Join'}
            </Button>
          </form>
        </div>

        <div className="border-t border-slate-800/60 pt-6 space-y-6">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            <Users size={14} className="text-slate-500" />
            Groups
          </h2>

          {groupsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <GroupCardSkeleton key={i} />)}
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No groups yet"
              description="Create a group to start splitting expenses with friends."
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus size={15} />
                  Create a group
                </Button>
              }
            />
          ) : (
            <>
              {activeGroups.length > 0 ? (
                <div className="space-y-2">
                  {activeGroups.map(renderGroupRow)}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No active groups — everything's settled up.</p>
              )}

              {archivedGroups.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Archive size={12} />
                    Archive
                  </p>
                  <div className="space-y-2 opacity-70">
                    {archivedGroups.map(renderGroupRow)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={(id) => navigate(`/groups/${id}`)}
        />
      )}
    </div>
  )
}
