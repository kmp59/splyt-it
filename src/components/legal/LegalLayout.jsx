import { useLayoutEffect } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ title, updated, children }) {
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    const reset = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    reset()
    // Guard against Chromium's scroll-anchoring nudging the position back
    // down once late-loading content (icons, fonts) settles.
    const raf = requestAnimationFrame(reset)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold shrink-0">
            splyt<span className="text-green-400">-it</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">{title}</h1>
        {updated && <p className="text-xs text-slate-500 mb-8">Last updated {updated}</p>}
        <div className="legal-prose space-y-6 text-sm sm:text-[15px] text-slate-300 leading-relaxed">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <Link to="/terms" className="hover:text-slate-400 transition-colors">
          Terms
        </Link>
        <span className="mx-2">·</span>
        <Link to="/copyright" className="hover:text-slate-400 transition-colors">
          Copyright
        </Link>
      </footer>
    </div>
  )
}
