import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { createGroup, searchUsers } from '../../services/db'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import LoadingSpinner from '../ui/LoadingSpinner'

const INPUT_CLS =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-sm'

export default function CreateGroupModal({ onClose, onCreated }) {
  const user = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const term = query.trim()
    debounceRef.current = setTimeout(
      async () => {
        if (!term) {
          setResults([])
          setSearching(false)
          return
        }
        setSearching(true)
        try {
          const users = await searchUsers(term, user.uid)
          setResults(users.filter((u) => !selected.some((s) => s.uid === u.uid)))
        } catch (err) {
          console.error(err)
        } finally {
          setSearching(false)
        }
      },
      term ? 250 : 0
    )
    return () => clearTimeout(debounceRef.current)
  }, [query, selected, user.uid])

  function addMember(u) {
    setSelected((prev) => [...prev, u])
    setResults((prev) => prev.filter((r) => r.uid !== u.uid))
    setQuery('')
  }

  function removeMember(uid) {
    setSelected((prev) => prev.filter((s) => s.uid !== uid))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const emails = selected.map((u) => u.email).filter(Boolean)
      const groupId = await createGroup(name.trim(), user.uid, emails)
      toast(`"${name.trim()}" created!`, 'success')
      onCreated(groupId)
      onClose()
    } catch (err) {
      console.error(err)
      toast('Failed to create group. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Create a group" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Group name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className={INPUT_CLS}
            placeholder="e.g. Cabo Trip, Dinner Club"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Invite members</label>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selected.map((u) => (
                <span
                  key={u.uid}
                  className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-full pl-1.5 pr-2 py-1 text-sm text-white"
                >
                  <Avatar name={u.displayName} uid={u.uid} size="xs" />
                  {u.displayName}
                  <button
                    type="button"
                    onClick={() => removeMember(u.uid)}
                    className="text-slate-500 hover:text-red-400 leading-none"
                    aria-label={`Remove ${u.displayName}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={INPUT_CLS}
              placeholder="Search by name or email"
            />

            {query.trim() && (
              <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                {searching && (
                  <div className="px-4 py-2.5 text-sm text-slate-400">Searching…</div>
                )}
                {!searching && results.length === 0 && (
                  <div className="px-4 py-2.5 text-sm text-slate-500">No users found</div>
                )}
                {!searching &&
                  results.map((u) => (
                    <button
                      type="button"
                      key={u.uid}
                      onClick={() => addMember(u)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-700/60 transition-colors"
                    >
                      <Avatar name={u.displayName} uid={u.uid} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">{u.displayName}</div>
                        <div className="text-xs text-slate-500 truncate">{u.email}</div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Only registered users can be found. Share the group ID to invite others.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
            {loading && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
            {loading ? 'Creating…' : 'Create group'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
