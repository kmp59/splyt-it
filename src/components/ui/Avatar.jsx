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

export default function Avatar({ name = '', uid = '', size = 'md', className = '' }) {
  const bg = colorFor(uid || name)
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none ${className}`}
      style={{ backgroundColor: bg }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}
