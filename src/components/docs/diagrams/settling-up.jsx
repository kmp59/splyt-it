function Node({ cx, cy, initial, name, dimmed }) {
  return (
    <g opacity={dimmed ? 0.4 : 1}>
      <circle cx={cx} cy={cy} r={26} fill="#1e293b" stroke="currentColor" strokeWidth="1.5" />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="16" fontWeight="600" fill="currentColor">
        {initial}
      </text>
      <text x={cx} y={cy + 26 + 18} textAnchor="middle" fontSize="12" fill="currentColor">
        {name}
      </text>
    </g>
  )
}

function AmountLabel({ x, y, amount, color = 'currentColor' }) {
  const label = `$${amount}`
  const w = label.length * 8 + 10
  return (
    <g>
      <rect x={x - w / 2} y={y - 11} width={w} height={20} rx={5} fill="#0f172a" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="600" fill={color}>
        {label}
      </text>
    </g>
  )
}

export default function SettlingUpDiagram() {
  const claim =
    'Both sides settle the exact same underlying debts between Alex, Sam, and Jo, but Simplified needs one payment instead of three, and Sam drops out entirely because their debts cancel to zero.'

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <figure>
        <svg
          viewBox="0 0 640 300"
          className="w-full h-auto text-slate-400"
          role="img"
          aria-label={claim}
        >
          <defs>
            <marker
              id="arrowNeutral"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
            </marker>
            <marker
              id="arrowGreen"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#4ade80" />
            </marker>
          </defs>

          {/* Divider */}
          <line x1="320" y1="16" x2="320" y2="288" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

          {/* Headings */}
          <text x="160" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
            Individual
          </text>
          <text x="480" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill="#4ade80">
            Simplified
          </text>

          {/* ---------- Individual (left) ---------- */}
          {/* Alex -> Sam: $20 */}
          <line
            x1="149.6" y1="93.8" x2="100.4" y2="206.2"
            stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowNeutral)"
          />
          {/* Sam -> Jo: $20 */}
          <line
            x1="116" y1="230" x2="204" y2="230"
            stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowNeutral)"
          />
          {/* Jo -> Alex: $5 */}
          <line
            x1="219.6" y1="206.2" x2="170.4" y2="93.8"
            stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowNeutral)"
          />

          <Node cx={160} cy={70} initial="A" name="Alex" />
          <Node cx={90} cy={230} initial="S" name="Sam" />
          <Node cx={230} cy={230} initial="J" name="Jo" />

          <AmountLabel x={112} y={150} amount={20} />
          <AmountLabel x={160} y={244} amount={20} />
          <AmountLabel x={210} y={150} amount={5} />

          {/* ---------- Simplified (right) ---------- */}
          {/* Alex -> Jo: $15 (nets out the whole triangle) */}
          <line
            x1="490.4" y1="93.8" x2="539.6" y2="206.2"
            stroke="#4ade80" strokeWidth="2.5" markerEnd="url(#arrowGreen)"
          />

          <Node cx={480} cy={70} initial="A" name="Alex" />
          <Node cx={410} cy={230} initial="S" name="Sam" dimmed />
          <Node cx={550} cy={230} initial="J" name="Jo" />

          <AmountLabel x={531} y={150} amount={15} color="#4ade80" />
          <text x="410" y="291" textAnchor="middle" fontSize="11" fill="#4ade80">
            settled
          </text>
        </svg>
        <figcaption className="text-xs text-slate-500 mt-3 text-center">
          {claim}
        </figcaption>
      </figure>
    </div>
  )
}
