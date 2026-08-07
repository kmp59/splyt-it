import { useLayoutEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { docs, getDocBySlug, searchDocs } from '../content/docs'
import { docDiagrams } from '../components/docs/diagrams'
import DocIcon from '../components/docs/DocIcon'
import DocSections from '../components/docs/DocSections'
import DocSearch from '../components/docs/DocSearch'

export default function DocPage() {
  const { slug } = useParams()
  const doc = getDocBySlug(slug)
  const [query, setQuery] = useState('')

  // Reset scroll on navigation between docs, same as the legal pages.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    const reset = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    reset()
    const raf = requestAnimationFrame(reset)
    return () => cancelAnimationFrame(raf)
  }, [slug])

  const results = useMemo(() => (query.trim() ? searchDocs(query).filter((d) => d.slug !== slug) : []), [query, slug])
  const otherDocs = useMemo(() => docs.filter((d) => d.slug !== slug), [slug])

  if (!doc) return <Navigate to="/docs" replace />

  const Diagram = docDiagrams[doc.slug]

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold shrink-0">
            splyt<span className="text-green-400">-it</span>
          </Link>
          <Link
            to="/docs"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            All guides
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6">
          <DocSearch value={query} onChange={setQuery} placeholder="Search other guides…" />
          {results.length > 0 && (
            <div className="mt-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              {results.slice(0, 5).map((d) => (
                <Link
                  key={d.slug}
                  to={`/docs/${d.slug}`}
                  onClick={() => setQuery('')}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                >
                  <DocIcon name={d.icon} size={14} className="text-green-400 shrink-0" />
                  <span className="truncate">{d.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-950/60 border border-green-900/50 shrink-0">
            <DocIcon name={doc.icon} size={16} className="text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{doc.title}</h1>
        </div>
        <p className="text-slate-400 text-sm sm:text-[15px] mb-8">{doc.summary}</p>

        {Diagram && (
          <div className="mb-8">
            <Diagram />
          </div>
        )}

        <DocSections sections={doc.sections} />

        <div className="border-t border-slate-800/60 mt-10 pt-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">More guides</h2>
          <div className="space-y-2">
            {otherDocs.map((d) => (
              <Link
                key={d.slug}
                to={`/docs/${d.slug}`}
                className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 rounded-xl px-3.5 py-2.5 transition-colors group"
              >
                <DocIcon name={d.icon} size={14} className="text-green-400 shrink-0" />
                <span className="flex-1 min-w-0 text-sm text-slate-300 truncate group-hover:text-green-300 transition-colors">
                  {d.title}
                </span>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        <span className="mx-2">·</span>
        <Link to="/copyright" className="hover:text-slate-400 transition-colors">Copyright</Link>
      </footer>
    </div>
  )
}
