import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
}

export default function Modal({ title, onClose, children, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={clsx(
          'bg-slate-900 border border-slate-700/80 w-full shadow-2xl flex flex-col',
          'rounded-t-2xl sm:rounded-2xl',
          'max-h-[92dvh]',
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h2 className="font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 overscroll-contain">{children}</div>
      </div>
    </div>
  )
}
