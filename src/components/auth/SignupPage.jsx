import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { signUp } from '../../services/auth'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'

const INPUT_CLS =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-sm'

const IS_LOCAL = import.meta.env.VITE_DATA_MODE === 'local'

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, name)
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            splyt<span className="text-green-400">-it</span>
          </h1>
          <p className="text-slate-400 text-sm">Split costs with your crew</p>
        </div>

        {IS_LOCAL && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs">
            <span className="font-semibold">Local mode</span> — your account will be stored in
            this browser only. Demo groups are created automatically after sign-up.
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className={INPUT_CLS}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={INPUT_CLS}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={INPUT_CLS}
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-slate-500 text-sm text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Invalid email address.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
