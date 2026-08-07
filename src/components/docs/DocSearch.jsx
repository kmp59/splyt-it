import { Search, X } from 'lucide-react'

export default function DocSearch({ value, onChange, autoFocus = false, placeholder = 'Search the docs…' }) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
