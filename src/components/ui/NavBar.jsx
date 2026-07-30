import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { signOut } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import Avatar from './Avatar'

const IS_LOCAL = import.meta.env.VITE_DATA_MODE === 'local'

export default function NavBar({ left }) {
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
            <Link to="/dashboard" className="text-lg font-bold text-white shrink-0">
              splyt<span className="text-green-400">-it</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block text-sm text-slate-400 max-w-[140px] truncate">
            {displayName}
          </span>
          <Avatar name={displayName} uid={user?.uid ?? ''} size="sm" />
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
