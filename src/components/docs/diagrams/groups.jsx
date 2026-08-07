export default function GroupsDiagram() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <figure>
        <svg
          viewBox="0 0 760 380"
          className="w-full h-auto text-slate-400"
          role="img"
          aria-label="Adding a member by email creates a pending invite that the invitee must accept (becoming a full member) or decline (removed); adding a guest skips invites entirely and adds them as a member immediately."
        >
          <defs>
            <marker id="groups-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <polygon points="0,0 10,5 0,10" fill="currentColor" />
            </marker>
          </defs>

          {/* Decision node */}
          <polygon
            points="120,120 215,195 120,270 25,195"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text x="120" y="190" textAnchor="middle" fontSize="12" fill="currentColor">Add member</text>
          <text x="120" y="205" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">by email or guest?</text>

          {/* Pending node */}
          <rect x="300" y="55" width="150" height="54" rx="8" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="375" y="77" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fbbf24">Pending</text>
          <text x="375" y="93" textAnchor="middle" fontSize="10" fill="#fbbf24" opacity="0.8">invite sent</text>
          <text x="375" y="124" textAnchor="middle" fontSize="9.5" fill="currentColor" opacity="0.6">
            shown as a card on invitee's dashboard
          </text>

          {/* Member node */}
          <rect x="580" y="15" width="150" height="54" rx="8" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="655" y="37" textAnchor="middle" fontSize="13" fontWeight="600" fill="#4ade80">Member</text>
          <text x="655" y="53" textAnchor="middle" fontSize="10" fill="#4ade80" opacity="0.8">full access</text>

          {/* Declined node */}
          <rect x="580" y="155" width="150" height="54" rx="8" fill="none" stroke="#f87171" strokeWidth="1.5" />
          <text x="655" y="177" textAnchor="middle" fontSize="13" fontWeight="600" fill="#f87171">Declined</text>
          <text x="655" y="193" textAnchor="middle" fontSize="10" fill="#f87171" opacity="0.8">invite removed</text>

          {/* Guest node */}
          <rect x="310" y="290" width="170" height="54" rx="8" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="395" y="312" textAnchor="middle" fontSize="13" fontWeight="600" fill="#94a3b8">Guest</text>
          <text x="395" y="328" textAnchor="middle" fontSize="10" fill="#94a3b8" opacity="0.8">added immediately</text>
          <text x="395" y="362" textAnchor="middle" fontSize="9.5" fill="currentColor" opacity="0.6">
            no account, no invite step
          </text>

          {/* Arrows */}
          <line x1="216" y1="172" x2="296" y2="90" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#groups-arrow)" />
          <text x="238" y="112" textAnchor="middle" fontSize="11" fill="currentColor">invites</text>
          <text x="238" y="125" textAnchor="middle" fontSize="11" fill="currentColor">by email</text>

          <line x1="452" y1="70" x2="578" y2="40" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#groups-arrow)" />
          <text x="515" y="43" textAnchor="middle" fontSize="11" fill="#4ade80">accepts</text>

          <line x1="452" y1="98" x2="578" y2="175" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#groups-arrow)" />
          <text x="500" y="148" textAnchor="middle" fontSize="11" fill="#f87171">declines</text>

          <line x1="168" y1="243" x2="322" y2="295" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#groups-arrow)" />
          <text x="215" y="280" textAnchor="middle" fontSize="11" fill="#94a3b8">adds as guest</text>
          <text x="215" y="293" textAnchor="middle" fontSize="11" fill="#94a3b8">directly</text>
        </svg>
        <figcaption className="text-xs text-slate-500 mt-3 text-center">
          Adding someone by email routes through a pending invite they must accept or decline; adding them as a guest skips that step and makes them a member right away.
        </figcaption>
      </figure>
    </div>
  )
}
