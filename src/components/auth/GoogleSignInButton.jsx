import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { signInWithGoogle, completeGoogleRedirect } from '../../services/auth'
import LoadingSpinner from '../ui/LoadingSpinner'

// Official Google "G" mark — kept as inline SVG so it renders crisp at any
// size without pulling in an icon font/library.
function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  )
}

export default function GoogleSignInButton({ label = 'Continue with Google' }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If signInWithGoogle() previously fell back to a full-page redirect
  // (popup blocked by the browser's third-party cookie/storage policy),
  // this page remounts once Firebase redirects back here. Pick up the
  // result and finish the job the click handler couldn't.
  useEffect(() => {
    let cancelled = false
    completeGoogleRedirect()
      .then((user) => {
        if (!cancelled && user) navigate('/dashboard')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Google sign-in failed. Please try again.')
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleClick() {
    setError('')
    setLoading(true)
    try {
      const { user } = await signInWithGoogle()
      // A null user means we fell back to signInWithRedirect — the browser
      // is navigating away now, and the effect above picks up the result
      // once it navigates back.
      if (user) navigate('/dashboard')
    } catch (err) {
      // User closing the popup isn't an error worth surfacing.
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-medium rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {loading ? <LoadingSpinner size="sm" className="border-slate-400 border-t-transparent" /> : <GoogleLogo />}
        {loading ? 'Signing in…' : label}
      </button>
      {error && (
        <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2 mt-3">
          {error}
        </p>
      )}
    </div>
  )
}
