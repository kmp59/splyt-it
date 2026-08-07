import { Link, useNavigate } from 'react-router'
import { LogOut, BookOpen } from 'lucide-react'
import { signOut } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import Avatar from './Avatar'

const IS_LOCAL = import.meta.env.VITE_DATA_MODE === 'local'

export default function NavBar({ left, inviteCount = 0 }) {
  const user = useAuth()
  const navigate = useNavigate()
  const displayName = user?.displayName || user?.email?.split('@')[0] || ''

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      {IS_LOCAL && (
        <div className="bg-amber-950/80 border-b border-amber-900/50 px-4 py-1 text-center text-xs text-amber-400 font-medium">
          Local mode — data stored in this browser only
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {left ?? (
            <Link to="/dashboard" className="flex items-center gap-1.5 text-lg font-bold text-white shrink-0">
              splyt<span className="text-green-400">-it</span>
              {inviteCount > 0 && (
                <span
                  title={`${inviteCount} pending invite${inviteCount === 1 ? '' : 's'}`}
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold leading-none"
                >
                  {inviteCount}
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/docs"
            title="Help & guides"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <BookOpen size={15} />
          </Link>
          <Link
            to="/account"
            title="Account settings"
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-slate-800 transition-colors"
          >
            <span className="hidden sm:block text-sm text-slate-400 max-w-[140px] truncate">
              {displayName}
            </span>
            <Avatar name={displayName} uid={user?.uid ?? ''} size="sm" />
          </Link>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
