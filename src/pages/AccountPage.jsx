import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { changePassword, changeDisplayName } from '../services/auth'
import { useAuth, useRefreshUser } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import NavBar from '../components/ui/NavBar'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const INPUT_CLS =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-sm'

export default function AccountPage() {
  const navigate = useNavigate()
  const user = useAuth()
  const refreshUser = useRefreshUser()
  const toast = useToast()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [nameLoading, setNameLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  async function handleNameSubmit(e) {
    e.preventDefault()
    if (!displayName.trim() || displayName.trim() === user?.displayName) return
    setNameLoading(true)
    try {
      await changeDisplayName(displayName.trim())
      refreshUser()
      toast('Username updated.')
    } catch {
      toast('Failed to update username.', 'error')
    } finally {
      setNameLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast('Password updated.')
    } catch (err) {
      setPasswordError(friendlyError(err.code))
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-950">
      <NavBar
        left={
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Account</span>
          </button>
        }
      />

      <div className="max-w-sm mx-auto p-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Username</h2>
          <p className="text-slate-400 text-sm mb-5">This is the name your group members see.</p>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className={INPUT_CLS}
                placeholder="Your name"
              />
            </div>
            <Button
              type="submit"
              disabled={nameLoading || !displayName.trim() || displayName.trim() === user?.displayName}
              className="w-full"
            >
              {nameLoading && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
              {nameLoading ? 'Saving…' : 'Save name'}
            </Button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Change password</h2>
          <p className="text-slate-400 text-sm mb-5">
            Confirm your current password to set a new one.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={INPUT_CLS}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={INPUT_CLS}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={INPUT_CLS}
                placeholder="••••••••"
              />
            </div>

            {passwordError && (
              <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
                {passwordError}
              </p>
            )}

            <Button type="submit" disabled={passwordLoading} className="w-full">
              {passwordLoading && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
              {passwordLoading ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Current password is incorrect.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    case 'auth/weak-password':
      return 'New password is too weak.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
