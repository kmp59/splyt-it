import clsx from 'clsx'

const variants = {
  primary: 'bg-green-600 hover:bg-green-500 active:bg-green-700 text-white',
  secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700',
  danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white',
  ghost: 'text-slate-400 hover:text-white hover:bg-slate-800',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        variants[variant],
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-5 py-3 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
