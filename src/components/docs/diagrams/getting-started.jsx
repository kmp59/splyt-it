const CLAIM =
  'New users sign up and returning users sign in, forgotten passwords are reset by email, and all paths land on the dashboard while unauthenticated visits to protected pages redirect back to sign-in.'

export default function GettingStartedDiagram() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
      <figure>
        <svg
          viewBox="0 0 900 480"
          className="w-full h-auto text-slate-400"
          role="img"
          aria-label={CLAIM}
        >
          <defs>
            <marker
              id="gsArrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
            </marker>
            <marker
              id="gsArrowGreen"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#4ade80" />
            </marker>
            <marker
              id="gsArrowAmber"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#fbbf24" />
            </marker>
            <marker
              id="gsArrowRed"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#f87171" />
            </marker>
          </defs>

          {/* ---- Nodes ---- */}

          {/* New user */}
          <rect x="40" y="45" width="140" height="50" rx="10" fill="none" stroke="currentColor" />
          <text x="110" y="75" textAnchor="middle" fontSize="12" fill="currentColor">
            New user
          </text>

          {/* Sign Up form */}
          <rect x="270" y="45" width="150" height="50" rx="10" fill="none" stroke="currentColor" />
          <text x="345" y="75" textAnchor="middle" fontSize="12" fill="currentColor">
            Sign Up
          </text>

          {/* Returning user */}
          <rect x="40" y="165" width="140" height="50" rx="10" fill="none" stroke="currentColor" />
          <text x="110" y="195" textAnchor="middle" fontSize="12" fill="currentColor">
            Returning user
          </text>

          {/* Sign In form */}
          <rect x="270" y="165" width="150" height="50" rx="10" fill="none" stroke="currentColor" />
          <text x="345" y="195" textAnchor="middle" fontSize="12" fill="currentColor">
            Sign In
          </text>

          {/* Dashboard (arrival / success) */}
          <rect
            x="700"
            y="100"
            width="160"
            height="60"
            rx="10"
            fill="none"
            stroke="#4ade80"
            strokeWidth="1.5"
          />
          <text x="780" y="135" textAnchor="middle" fontSize="12" fill="#4ade80">
            Dashboard
          </text>

          {/* Reset Password form */}
          <rect x="270" y="285" width="150" height="50" rx="10" fill="none" stroke="currentColor" />
          <text x="345" y="308" textAnchor="middle" fontSize="12" fill="currentColor">
            Reset Password
          </text>

          {/* Reset email sent (pending state) */}
          <rect
            x="500"
            y="285"
            width="150"
            height="50"
            rx="10"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
          <text x="575" y="308" textAnchor="middle" fontSize="12" fill="#fbbf24">
            Reset Email
          </text>
          <text x="575" y="323" textAnchor="middle" fontSize="10" fill="#fbbf24">
            (pending)
          </text>

          {/* No session */}
          <rect x="40" y="395" width="140" height="50" rx="10" fill="none" stroke="currentColor" />
          <text x="110" y="425" textAnchor="middle" fontSize="12" fill="currentColor">
            No session
          </text>

          {/* Protected page (blocked state) */}
          <rect
            x="270"
            y="395"
            width="150"
            height="50"
            rx="10"
            fill="none"
            stroke="#f87171"
            strokeWidth="1.5"
          />
          <text x="345" y="418" textAnchor="middle" fontSize="12" fill="#f87171">
            Protected Page
          </text>
          <text x="345" y="433" textAnchor="middle" fontSize="10" fill="#f87171">
            (blocked)
          </text>

          {/* ---- Edges ---- */}

          {/* New user -> Sign Up */}
          <line
            x1="180"
            y1="70"
            x2="264"
            y2="70"
            stroke="currentColor"
            markerEnd="url(#gsArrow)"
          />
          <text x="222" y="62" textAnchor="middle" fontSize="11" fill="currentColor">
            signs up
          </text>

          {/* Sign Up -> Dashboard */}
          <polyline
            points="420,70 650,70 650,130 694,130"
            fill="none"
            stroke="#4ade80"
            markerEnd="url(#gsArrowGreen)"
          />
          <text x="560" y="62" textAnchor="middle" fontSize="11" fill="#4ade80">
            account created
          </text>

          {/* Returning user -> Sign In */}
          <line
            x1="180"
            y1="190"
            x2="264"
            y2="190"
            stroke="currentColor"
            markerEnd="url(#gsArrow)"
          />
          <text x="222" y="182" textAnchor="middle" fontSize="11" fill="currentColor">
            signs in
          </text>

          {/* Sign In -> Dashboard */}
          <polyline
            points="420,190 620,190 620,145 694,132"
            fill="none"
            stroke="#4ade80"
            markerEnd="url(#gsArrowGreen)"
          />
          <text x="560" y="182" textAnchor="middle" fontSize="11" fill="#4ade80">
            valid credentials
          </text>

          {/* Sign In -> Reset Password */}
          <line
            x1="345"
            y1="215"
            x2="345"
            y2="279"
            stroke="currentColor"
            markerEnd="url(#gsArrow)"
          />
          <text x="422" y="250" textAnchor="start" fontSize="11" fill="currentColor">
            forgot password
          </text>

          {/* Reset Password -> Reset Email */}
          <line
            x1="420"
            y1="310"
            x2="494"
            y2="310"
            stroke="currentColor"
            markerEnd="url(#gsArrow)"
          />
          <text x="457" y="302" textAnchor="middle" fontSize="11" fill="currentColor">
            sends link
          </text>

          {/* Reset Email -> Sign In (loop back) */}
          <polyline
            points="575,285 575,140 420,140"
            fill="none"
            stroke="#fbbf24"
            markerEnd="url(#gsArrowAmber)"
          />
          <text x="497" y="132" textAnchor="middle" fontSize="11" fill="#fbbf24">
            resets &amp; signs in
          </text>

          {/* No session -> Protected page */}
          <line
            x1="180"
            y1="420"
            x2="264"
            y2="420"
            stroke="currentColor"
            markerEnd="url(#gsArrow)"
          />
          <text x="222" y="412" textAnchor="middle" fontSize="11" fill="currentColor">
            visits page
          </text>

          {/* Protected page -> Sign In (redirect, blocked) */}
          <polyline
            points="270,410 200,410 200,190 264,190"
            fill="none"
            stroke="#f87171"
            markerEnd="url(#gsArrowRed)"
          />
          <text x="150" y="300" textAnchor="middle" fontSize="11" fill="#f87171">
            redirects
          </text>
        </svg>
        <figcaption className="text-xs text-slate-500 mt-3 text-center">
          {CLAIM}
        </figcaption>
      </figure>
    </div>
  )
}
