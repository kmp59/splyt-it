import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', className }) {
  const s = {
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }[size]

  return (
    <div
      className={clsx(s, 'border-green-600 border-t-transparent rounded-full animate-spin', className)}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <LoadingSpinner size="md" />
    </div>
  )
}
