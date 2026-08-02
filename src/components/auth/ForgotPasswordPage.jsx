import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../../services/auth'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'

const INPUT_CLS =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors text-sm'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
    } catch (err) {
      // Don't reveal whether the email is registered — same message either way.
      if (err.code !== 'auth/user-not-found') {
        setError('Something went wrong. Please try again.')
        setLoading(false)
        return
      }
    }
    setSent(true)
    setLoading(false)
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {sent ? (
            <>
              <h2 className="text-base font-semibold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm">
                If an account exists for <span className="text-slate-200">{email}</span>, we've
                sent a link to reset your password.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-white mb-1">Reset your password</h2>
              <p className="text-slate-400 text-sm mb-5">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {error && (
                  <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={loading} className="w-full mt-1">
                  {loading && <LoadingSpinner size="sm" className="border-white border-t-transparent" />}
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-slate-500 text-sm text-center mt-5">
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
