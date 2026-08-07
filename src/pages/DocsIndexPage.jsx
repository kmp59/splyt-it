import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, BookOpen } from 'lucide-react'
import { docs, appSummary, searchDocs } from '../content/docs'
import DocIcon from '../components/docs/DocIcon'
import DocSearch from '../components/docs/DocSearch'

export default function DocsIndexPage() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchDocs(query), [query])

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold shrink-0">
            splyt<span className="text-green-400">-it</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Go to app
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-950/60 border border-green-900/50">
            <BookOpen size={16} className="text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{appSummary.title}</h1>
        </div>
        <p className="text-slate-300 text-base sm:text-lg mb-6">{appSummary.tagline}</p>

        <div className="space-y-3 mb-8 text-sm sm:text-[15px] text-slate-400 leading-relaxed">
          {appSummary.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mb-8">
          <DocSearch value={query} onChange={setQuery} placeholder="Search guides — e.g. “split percent”, “archive”, “password”…" />
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {query.trim() ? `${results.length} result${results.length === 1 ? '' : 's'}` : `All guides · ${docs.length}`}
          </h2>

          {results.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No guides match “{query}”. Try a different search term.
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((doc) => (
                <Link
                  key={doc.slug}
                  to={`/docs/${doc.slug}`}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 rounded-2xl px-4 py-3.5 transition-colors group"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 shrink-0">
                    <DocIcon name={doc.icon} size={16} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-green-300 transition-colors">
                      {doc.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{doc.summary}</p>
                  </div>
                  <ChevronRight size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
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
