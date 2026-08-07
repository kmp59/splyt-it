const COLORS = ['#16a34a', '#2563eb', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#dc2626']

function colorFor(seed = '') {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(h) % COLORS.length]
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

const sizes = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

// status: 'guest' -> dark gray dot, 'member' -> green dot, omit for none.
const STATUS_COLORS = {
  guest: 'bg-slate-500',
  member: 'bg-green-500',
}

const statusDotSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

export default function Avatar({ name = '', uid = '', size = 'md', status, className = '' }) {
  const bg = colorFor(uid || name)
  const statusColor = STATUS_COLORS[status]
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white select-none`}
        style={{ backgroundColor: bg }}
        aria-label={name}
      >
        {initials(name)}
      </div>
      {statusColor && (
        <span
          className={`absolute -top-0.5 -right-0.5 ${statusDotSizes[size]} ${statusColor} rounded-full ring-2 ring-slate-900`}
          aria-label={status === 'guest' ? 'Guest' : 'Registered member'}
          title={status === 'guest' ? 'Guest' : 'Registered member'}
        />
      )}
    </div>
  )
}
