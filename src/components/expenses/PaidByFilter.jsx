import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Check, ChevronDown, ListFilter, X } from 'lucide-react'
import Avatar from '../ui/Avatar'

// Compact "Paid by" filter for the expense list: a pill that opens a small
// member menu (same look as the Paid by picker in AddExpenseModal). When a
// person is selected the pill turns green and gets an × to clear it.
// `nameOf` is the label (e.g. "You"); `avatarNameOf` the real name for initials.
export default function PaidByFilter({ options, value, onChange, nameOf, avatarNameOf = nameOf }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(uid) {
    onChange(uid)
    setOpen(false)
  }

  const active = !!value

  return (
    <div className="flex items-center gap-2">
      <span id="paid-by-filter-label" className="text-xs text-slate-500">Filter by</span>
      <div ref={ref} className="relative">
        <div
          className={clsx(
            'flex items-center h-8 rounded-lg border text-xs transition-colors',
            active ? 'border-green-700/60 bg-green-950/40 text-green-300' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600'
          )}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby="paid-by-filter-label paid-by-filter-value"
            className={clsx(
              'flex items-center gap-1.5 h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
              active ? 'pl-2 pr-1.5' : 'px-3'
            )}
          >
            {active ? (
              <>
                <Avatar name={avatarNameOf(value)} uid={value} size="xs" />
                <span id="paid-by-filter-value" className="max-w-[12rem] truncate"><span className="text-green-500/80">Paid by</span> <span className="font-medium">{nameOf(value)}</span></span>
              </>
            ) : (
              <>
                <ListFilter size={13} className="text-slate-400" />
                <span id="paid-by-filter-value">Paid by <span className="text-white font-medium">Everyone</span></span>
              </>
            )}
            <ChevronDown size={13} className={clsx('shrink-0 transition-transform', active ? 'text-green-400' : 'text-slate-400', open && 'rotate-180')} />
          </button>
          {active && (
            <button
              type="button"
              onClick={() => pick('')}
              aria-label="Clear paid by filter"
              title="Show everyone"
              className="flex items-center justify-center h-full pl-1 pr-2 border-l border-green-800/50 text-green-400 hover:text-green-200 rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {open && (
          <div
            role="listbox"
            aria-label="Filter by who paid"
            className="absolute right-0 top-full mt-1.5 z-20 w-56 max-w-[calc(100vw-2rem)] bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="max-h-64 overflow-y-auto overscroll-contain py-1">
              {[{ uid: '', label: 'Everyone' }, ...options.map((uid) => ({ uid, label: nameOf(uid) }))].map(({ uid, label }) => {
                const selected = value === uid
                return (
                  <button
                    key={uid || 'everyone'}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => pick(uid)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                      selected ? 'bg-green-950/60 text-green-300' : 'text-slate-300 hover:bg-slate-700/60'
                    )}
                  >
                    {uid ? (
                      <Avatar name={avatarNameOf(uid)} uid={uid} size="xs" />
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-700 shrink-0">
                        <ListFilter size={11} className="text-slate-300" />
                      </span>
                    )}
                    <span className="flex-1 truncate">{label}</span>
                    {selected && <Check size={13} className="text-green-400 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
