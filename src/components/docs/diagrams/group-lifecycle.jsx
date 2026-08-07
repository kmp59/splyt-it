function GroupLifecycleDiagram() {
  const claim =
    'A group moves left to right from Active to Settling Up to Archived, gated by a zero-balance check, and can be reopened straight back to Active.'

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <figure>
        <svg
          viewBox="0 0 760 300"
          className="w-full h-auto text-slate-400"
          role="img"
          aria-label={claim}
        >
          <defs>
            <marker
              id="gl-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
            </marker>
          </defs>

          {/* ---- Forward flow arrows ---- */}
          {/* Active -> Settling Up */}
          <line
            x1="215" y1="90"
            x2="303" y2="90"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#gl-arrow)"
          />
          <text x="259" y="72" textAnchor="middle" fontSize="12" fill="currentColor">
            Complete trip
          </text>

          {/* Settling Up -> Archived */}
          <line
            x1="475" y1="90"
            x2="563" y2="90"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#gl-arrow)"
          />
          <text x="519" y="63" textAnchor="middle" fontSize="12" fill="currentColor">
            Archive group
          </text>
          <text x="519" y="79" textAnchor="middle" fontSize="11" fill="#fbbf24">
            (requires $0 balances)
          </text>

          {/* ---- Reverse arrow: Archived -> Active, curved along the bottom ---- */}
          <path
            d="M 630 120 C 630 230, 145 230, 145 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#gl-arrow)"
          />
          <text x="388" y="255" textAnchor="middle" fontSize="12" fill="currentColor">
            Reopen trip
          </text>

          {/* ---- Active node ---- */}
          <rect
            x="40" y="55" width="175" height="70" rx="12"
            fill="none" stroke="#e2e8f0" strokeWidth="2"
          />
          <text x="127" y="85" textAnchor="middle" fontSize="14" fontWeight="600" fill="#e2e8f0">
            Active
          </text>
          <text x="127" y="104" textAnchor="middle" fontSize="11" fill="currentColor">
            expenses freely added
          </text>

          {/* ---- Settling Up node ---- */}
          <rect
            x="303" y="55" width="172" height="70" rx="12"
            fill="none" stroke="#fbbf24" strokeWidth="2"
          />
          <text x="389" y="85" textAnchor="middle" fontSize="14" fontWeight="600" fill="#fbbf24">
            Settling Up
          </text>
          <text x="389" y="104" textAnchor="middle" fontSize="11" fill="currentColor">
            still editable, wrapping up
          </text>

          {/* ---- Archived node ---- */}
          <rect
            x="563" y="55" width="160" height="70" rx="12"
            fill="none" stroke="#94a3b8" strokeWidth="2"
          />
          <text x="643" y="85" textAnchor="middle" fontSize="14" fontWeight="600" fill="#94a3b8">
            Archived
          </text>
          <text x="643" y="104" textAnchor="middle" fontSize="11" fill="currentColor">
            hidden from main list
          </text>
        </svg>
        <figcaption className="text-xs text-slate-500 mt-3 text-center">
          {claim}
        </figcaption>
      </figure>
    </div>
  )
}

export default GroupLifecycleDiagram
