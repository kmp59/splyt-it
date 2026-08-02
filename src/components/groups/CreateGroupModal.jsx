import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { createGroup, lookupUserByEmail } from '../../services/db'
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
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleLookup(e) {
    e.preventDefault()
    const term = query.trim()
    if (!term) return
    setLookupError('')
    setLooking(true)
    try {
      const found = await lookupUserByEmail(term, user.uid)
      if (!found) {
        setLookupError('No user with that email')
        return
      }
      if (selected.some((s) => s.uid === found.uid)) {
        setLookupError('Already added')
        return
      }
      addMember(found)
    } catch (err) {
      console.error(err)
      setLookupError('Lookup failed. Please try again.')
    } finally {
      setLooking(false)
    }
  }

  function addMember(u) {
    setSelected((prev) => [...prev, u])
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
                    className="text-slate-500 hover:text-red-400 leading-none p-2 -m-2"
                    aria-label={`Remove ${u.displayName}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setLookupError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleLookup(e)
                }
              }}
              className={INPUT_CLS}
              placeholder="Enter their exact email"
            />
            <Button type="button" variant="secondary" onClick={handleLookup} disabled={looking || !query.trim()}>
              {looking ? <LoadingSpinner size="sm" /> : 'Add'}
            </Button>
          </div>
          {lookupError && <p className="text-xs text-red-400 mt-1.5">{lookupError}</p>}
          <p className="text-xs text-slate-500 mt-1.5">
            They'll be invited and need to accept before joining.
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
