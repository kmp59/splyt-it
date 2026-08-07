const PEOPLE = [
  { name: 'Alex', color: '#4ade80' },
  { name: 'Sam', color: '#60a5fa' },
  { name: 'Jo', color: '#a78bfa' },
]

const BARS = [
  {
    type: 'Equal',
    note: 'even split',
    shares: [30, 30, 30],
  },
  {
    type: 'Exact',
    note: 'Alex ordered steak',
    shares: [50, 25, 15],
  },
  {
    type: 'Percent',
    note: '50% / 30% / 20%',
    shares: [45, 27, 18],
  },
]

const TOTAL = 90
const BAR_X = 130
const BAR_W = 400
const BAR_H = 34
const ROW_GAP = 78
const TOP = 56

export default function ExpensesSplitDiagram() {
  const width = 600
  const height = TOP + BARS.length * ROW_GAP + 60

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <figure>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-slate-400"
          role="img"
          aria-label="Comparison of a $90 dinner split three ways among Alex, Sam, and Jo under Equal ($30/$30/$30), Exact ($50/$25/$15), and Percent (50%/30%/20% = $45/$27/$18) split types."
        >
          {/* Title */}
          <text x={width / 2} y={26} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
            Same $90 dinner, three ways to split it
          </text>

          {/* Legend */}
          {PEOPLE.map((p, i) => {
            const lx = width / 2 - 140 + i * 100
            return (
              <g key={p.name}>
                <rect x={lx} y={38} width={10} height={10} rx={2} fill={p.color} />
                <text x={lx + 16} y={47} fontSize="11" fill="currentColor">
                  {p.name}
                </text>
              </g>
            )
          })}

          {BARS.map((bar, rowIdx) => {
            const y = TOP + rowIdx * ROW_GAP + 20
            let xCursor = BAR_X
            const segments = bar.shares.map((share, i) => {
              const w = (share / TOTAL) * BAR_W
              const seg = { x: xCursor, w, share, person: PEOPLE[i] }
              xCursor += w
              return seg
            })

            return (
              <g key={bar.type}>
                {/* Row label */}
                <text x={0} y={y + BAR_H / 2 - 6} fontSize="13" fontWeight="600" fill="currentColor">
                  {bar.type}
                </text>
                <text x={0} y={y + BAR_H / 2 + 10} fontSize="11" fill="currentColor" opacity="0.7">
                  {bar.note}
                </text>

                {/* Bar outline */}
                <rect
                  x={BAR_X}
                  y={y}
                  width={BAR_W}
                  height={BAR_H}
                  rx={6}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.4"
                />

                {/* Segments */}
                {segments.map((seg, i) => (
                  <g key={i}>
                    <rect
                      x={seg.x}
                      y={y}
                      width={seg.w}
                      height={BAR_H}
                      fill={seg.person.color}
                      opacity="0.85"
                      rx={i === 0 || i === segments.length - 1 ? 6 : 0}
                    />
                    {seg.w > 34 && (
                      <text
                        x={seg.x + seg.w / 2}
                        y={y + BAR_H / 2 + 4}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill="#0f172a"
                      >
                        ${seg.share}
                      </text>
                    )}
                  </g>
                ))}

                {/* Total label at end of bar */}
                <text
                  x={BAR_X + BAR_W + 10}
                  y={y + BAR_H / 2 + 4}
                  fontSize="11"
                  fill="currentColor"
                  opacity="0.7"
                >
                  ${TOTAL}
                </text>
              </g>
            )
          })}
        </svg>
        <figcaption className="text-xs text-slate-500 mt-3 text-center">
          The same $90 dinner among Alex, Sam, and Jo divides differently depending on the split type chosen — Equal spreads it evenly, Exact matches who actually ordered what, and Percent applies agreed-upon shares.
        </figcaption>
      </figure>
    </div>
  )
}
