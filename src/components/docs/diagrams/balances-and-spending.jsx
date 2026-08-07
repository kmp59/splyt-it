function BalancesAndSpendingDiagram() {
  const rows = [
    { label: 'Expense 1 — Sam paid', amount: '+$60.00', color: '#4ade80' },
    { label: 'Expense 1 — Sam’s share', amount: '−$20.00', color: '#fb923c' },
    { label: 'Expense 2 — Sam’s share', amount: '−$15.00', color: '#fb923c' },
    { label: 'Payment — Sam paid Jordan back', amount: '−$10.00', color: '#fb923c' },
  ]

  const startY = 66
  const rowH = 34
  const labelX = 24
  const amountX = 456
  const width = 480
  const dividerY = startY + rows.length * rowH + 6
  const totalY = dividerY + 38
  const height = totalY + 24

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <figure>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-slate-400"
          role="img"
          aria-label="Ledger showing how Sam's balance of plus $15 is derived: $60 paid on Expense 1 minus a $20 share, minus a $15 share on Expense 2, minus a $10 payment made to Jordan, summing to a net balance of plus $15 owed to Sam."
        >
          <text x={labelX} y={30} fontSize="14" fontWeight="600" fill="currentColor">
            Sam's balance — how it adds up
          </text>
          <text x={labelX} y={48} fontSize="11" fill="currentColor" opacity="0.7">
            Every dollar paid adds, every dollar of share subtracts
          </text>

          {rows.map((row, i) => {
            const y = startY + i * rowH
            return (
              <g key={row.label}>
                <text x={labelX} y={y} fontSize="12" fill="currentColor">
                  {row.label}
                </text>
                <text
                  x={amountX}
                  y={y}
                  fontSize="13"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fill={row.color}
                  textAnchor="end"
                >
                  {row.amount}
                </text>
              </g>
            )
          })}

          <line
            x1={labelX}
            y1={dividerY}
            x2={amountX}
            y2={dividerY}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.35"
          />

          <text x={labelX} y={totalY} fontSize="13" fontWeight="600" fill="currentColor">
            Net balance — Sam is owed
          </text>
          <text
            x={amountX}
            y={totalY}
            fontSize="18"
            fontWeight="700"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fill="#4ade80"
            textAnchor="end"
          >
            +$15.00
          </text>
        </svg>
        <figcaption className="text-xs text-slate-500 mt-3 text-center">
          A worked example: Sam's balance is what Sam paid, minus Sam's share of each expense, minus payments Sam already made — net +$15 means the group owes Sam $15.
        </figcaption>
      </figure>
    </div>
  )
}

export default BalancesAndSpendingDiagram
