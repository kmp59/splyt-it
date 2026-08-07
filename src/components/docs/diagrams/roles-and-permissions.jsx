function RolesAndPermissionsDiagram() {
  const claim =
    'Only the owner can promote admins or remove other members, any admin (including the owner) can demote an admin or merge a guest into a member, and merging moves a guest\'s expenses and payments onto the member while deleting the guest.'

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <figure>
        <svg
          viewBox="0 0 920 480"
          className="w-full h-auto text-slate-400"
          role="img"
          aria-label={claim}
        >
          <defs>
            <marker
              id="rp-arrow"
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

          {/* ============ Panel divider ============ */}
          <line x1="450" y1="20" x2="450" y2="460" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" opacity="0.4" />

          {/* ============ Panel 1: who can act on whom ============ */}
          <text x="225" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
            Who can act on whom
          </text>

          {/* Owner node */}
          <rect x="160" y="42" width="130" height="46" rx="10" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <text x="225" y="70" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fbbf24">Owner</text>

          {/* Admin node */}
          <rect x="160" y="150" width="130" height="46" rx="10" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="225" y="178" textAnchor="middle" fontSize="13" fontWeight="600" fill="#4ade80">Admin</text>

          {/* Member node */}
          <rect x="35" y="270" width="130" height="46" rx="10" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <text x="100" y="298" textAnchor="middle" fontSize="13" fontWeight="600" fill="#e2e8f0">Member</text>

          {/* Guest node */}
          <rect x="235" y="270" width="130" height="46" rx="10" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 4" />
          <text x="300" y="294" textAnchor="middle" fontSize="13" fontWeight="600" fill="#a78bfa">Guest</text>
          <text x="300" y="308" textAnchor="middle" fontSize="9" fill="currentColor">(no login)</text>

          {/* Owner -> Admin: promote (curve left) */}
          <path
            d="M 195 88 C 175 108, 175 130, 195 150"
            fill="none" stroke="currentColor" strokeWidth="2"
            markerEnd="url(#rp-arrow)"
          />
          <text x="146" y="122" textAnchor="middle" fontSize="11" fill="currentColor">promote</text>
          <text x="146" y="134" textAnchor="middle" fontSize="9" fill="#fbbf24">(owner only)</text>

          {/* Owner -> Admin: demote (curve right) */}
          <path
            d="M 255 88 C 275 108, 275 130, 255 150"
            fill="none" stroke="currentColor" strokeWidth="2"
            markerEnd="url(#rp-arrow)"
          />
          <text x="322" y="122" textAnchor="middle" fontSize="11" fill="currentColor">demote</text>
          <text x="322" y="134" textAnchor="middle" fontSize="9" fill="currentColor">(owner or admin)</text>

          {/* Admin self loop: demote self */}
          <path
            d="M 290 160 C 330 150, 330 190, 290 182"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            markerEnd="url(#rp-arrow)"
          />
          <text x="340" y="174" textAnchor="middle" fontSize="9" fill="currentColor">demote</text>
          <text x="340" y="185" textAnchor="middle" fontSize="9" fill="currentColor">self</text>

          {/* Owner -> Member: remove */}
          <path
            d="M 195 82 C 90 130, 70 200, 92 270"
            fill="none" stroke="currentColor" strokeWidth="2"
            markerEnd="url(#rp-arrow)"
          />
          <text x="70" y="200" textAnchor="middle" fontSize="11" fill="currentColor">remove</text>
          <text x="70" y="212" textAnchor="middle" fontSize="9" fill="#fbbf24">(owner only)</text>

          {/* Owner -> Guest: remove */}
          <path
            d="M 262 88 C 320 140, 320 210, 295 270"
            fill="none" stroke="currentColor" strokeWidth="2"
            markerEnd="url(#rp-arrow)"
          />
          <text x="335" y="200" textAnchor="middle" fontSize="11" fill="currentColor">remove</text>
          <text x="335" y="212" textAnchor="middle" fontSize="9" fill="#fbbf24">(owner only)</text>

          {/* Member self loop: leave */}
          <path
            d="M 58 316 C 40 345, 90 345, 105 318"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            markerEnd="url(#rp-arrow)"
          />
          <text x="72" y="362" textAnchor="middle" fontSize="9" fill="currentColor">leave (self)</text>

          <text x="225" y="400" textAnchor="middle" fontSize="10" fill="currentColor">
            Owner is permanent — never removed, never demoted.
          </text>
          <text x="225" y="416" textAnchor="middle" fontSize="10" fill="currentColor">
            Guests can't be promoted or leave themselves.
          </text>

          {/* ============ Panel 2: guest merge before/after ============ */}
          <text x="685" y="26" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
            Merging a guest
          </text>

          <text x="490" y="55" fontSize="10" fontWeight="600" fill="currentColor">BEFORE</text>

          {/* Before: Guest node */}
          <rect x="480" y="65" width="140" height="56" rx="10" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 4" />
          <text x="550" y="88" textAnchor="middle" fontSize="12" fontWeight="600" fill="#a78bfa">Guest</text>
          <text x="550" y="104" textAnchor="middle" fontSize="9" fill="currentColor">3 expenses · 2 payments</text>

          {/* Before: Member node */}
          <rect x="730" y="65" width="140" height="56" rx="10" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <text x="800" y="88" textAnchor="middle" fontSize="12" fontWeight="600" fill="#e2e8f0">Member</text>
          <text x="800" y="104" textAnchor="middle" fontSize="9" fill="currentColor">their own history</text>

          {/* Before -> merge arrow */}
          <line x1="620" y1="93" x2="726" y2="93" stroke="currentColor" strokeWidth="2" markerEnd="url(#rp-arrow)" />
          <text x="673" y="79" textAnchor="middle" fontSize="10" fill="currentColor">merge</text>
          <text x="673" y="132" textAnchor="middle" fontSize="9" fill="#4ade80">(owner or admin)</text>

          <text x="490" y="200" fontSize="10" fontWeight="600" fill="currentColor">AFTER</text>

          {/* After: Guest node removed */}
          <rect x="480" y="210" width="140" height="56" rx="10" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.4" />
          <line x1="486" y1="216" x2="614" y2="260" stroke="#a78bfa" strokeWidth="1.5" opacity="0.4" />
          <text x="550" y="234" textAnchor="middle" fontSize="12" fill="#a78bfa" opacity="0.6">Guest</text>
          <text x="550" y="250" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">removed from group</text>

          {/* After: Member node absorbs */}
          <rect x="720" y="210" width="160" height="56" rx="10" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <text x="800" y="230" textAnchor="middle" fontSize="12" fontWeight="600" fill="#e2e8f0">Member</text>
          <text x="800" y="245" textAnchor="middle" fontSize="8.5" fill="currentColor">+ guest's 3 expenses</text>
          <text x="800" y="257" textAnchor="middle" fontSize="8.5" fill="currentColor">· 2 payments</text>

          {/* dashed connector before->after showing transformation */}
          <path
            d="M 550 121 C 550 155, 550 175, 550 210"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5"
          />
          <path
            d="M 800 121 C 800 155, 800 175, 800 210"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5"
          />

          <text x="685" y="300" textAnchor="middle" fontSize="10" fill="currentColor">
            Merging can't be undone — double-check the target member first.
          </text>
        </svg>
        <figcaption className="text-xs text-slate-500 mt-3 text-center">
          {claim}
        </figcaption>
      </figure>
    </div>
  )
}

export default RolesAndPermissionsDiagram
