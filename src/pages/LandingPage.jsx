import { Link } from 'react-router'
import { ArrowRight, Check, Sparkles, CheckCircle2, Plus } from 'lucide-react'
import clsx from 'clsx'
import Button from '../components/ui/Button'

const CREW = [
  { id: 'A', name: 'Alex' },
  { id: 'S', name: 'Sam' },
  { id: 'J', name: 'Jae' },
  { id: 'P', name: 'Priya' },
]

const AVATAR_STYLE = {
  A: 'bg-green-500/15 border-green-500/40 text-green-300',
  S: 'bg-teal-500/15 border-teal-500/40 text-teal-300',
  J: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  P: 'bg-lime-500/15 border-lime-500/40 text-lime-300',
}

const EXPENSES = [
  { label: 'Dinner', amount: '$84', by: 'A' },
  { label: 'Uber', amount: '$22', by: 'S' },
  { label: 'Tickets', amount: '$46', by: 'J' },
  { label: 'Snacks', amount: '$12', by: 'P' },
]

const SETTLEMENTS = [
  { from: 'S', to: 'A', amount: '$18' },
  { from: 'J', to: 'P', amount: '$9' },
]

const FEATURES = [
  'Smart settlement math finds the minimum number of payments',
  'Split evenly, by percentage, or exact custom amounts',
  'Real-time balances so everyone knows where they stand',
  'Free, fast, and built for groups of any size',
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-slate-950 text-white overflow-x-hidden">
      <BackgroundGlow />

      {/* Nav */}
      <header className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <span className="text-lg font-bold">
          splyt<span className="text-green-400">-it</span>
        </span>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
          <Sparkles size={12} />
          Split costs, not friendships
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
          Split any cost with your crew<span className="text-green-400">.</span>
          <br />
          Settled up in seconds.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-8">
          Trips, dinners, gifts — Splyt tracks who paid, who owes, and gets everyone
          square with the fewest payments possible.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Start splitting
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Animated flow */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <FlowChart />
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-5">Why splyt-it</h2>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15 text-green-400 shrink-0">
                  <Check size={12} strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to stop doing math in group chats?</h2>
        <p className="text-slate-400 mb-7 text-sm sm:text-base">
          It's free and takes less than a minute to set up your first group.
        </p>
        <Link to="/signup">
          <Button size="lg" className="gap-2">
            Create your group
            <ArrowRight size={16} />
          </Button>
        </Link>
      </section>

      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>splyt-it — split any cost with your crew in seconds.</p>
        <p className="mt-2">
          <Link to="/terms" className="hover:text-slate-400 transition-colors">
            Terms & Conditions
          </Link>
          <span className="mx-2">·</span>
          <Link to="/copyright" className="hover:text-slate-400 transition-colors">
            Copyright
          </Link>
        </p>
      </footer>
    </div>
  )
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden -z-0">
      <div className="absolute left-1/2 -top-40 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-green-500/10 blur-[120px]" />
    </div>
  )
}

const STEPS = [
  { title: 'Everyone piles in', desc: 'Add your crew to a group — anyone can join in seconds.' },
  { title: 'Log costs as they happen', desc: 'Each expense is tagged to whoever paid for it.' },
  { title: 'Splyt settles the tab', desc: 'The fewest payments to make everyone square.' },
]

function FlowChart() {
  return (
    <div className="flex flex-col items-stretch max-w-md mx-auto">
      <StepCard index={0} title={STEPS[0].title} desc={STEPS[0].desc}>
        <CrewRow />
      </StepCard>
      <Connector index={0} />
      <StepCard index={1} title={STEPS[1].title} desc={STEPS[1].desc}>
        <ExpensesList />
      </StepCard>
      <Connector index={1} />
      <StepCard index={2} title={STEPS[2].title} desc={STEPS[2].desc}>
        <SettleList />
      </StepCard>
    </div>
  )
}

function StepCard({ index, title, desc, children }) {
  return (
    <div
      className="flow-node relative bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 hover:border-slate-700 transition-colors"
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      <span className="absolute top-4 right-5 text-[10px] font-semibold text-slate-600">
        0{index + 1}
      </span>
      <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">{title}</h3>
      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{desc}</p>
      {children}
    </div>
  )
}

function Avatar({ id, size = 'md' }) {
  const dims = size === 'md' ? 'w-11 h-11 text-sm' : 'w-7 h-7 text-[11px]'
  return (
    <div
      className={clsx(
        'rounded-full border flex items-center justify-center font-semibold shrink-0',
        dims,
        AVATAR_STYLE[id]
      )}
    >
      {id}
    </div>
  )
}

function CrewRow() {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        {CREW.map((member, i) => (
          <div
            key={member.id}
            className="flex flex-col items-center gap-1.5 avatar-pop"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="pulse-ring rounded-full">
              <Avatar id={member.id} />
            </div>
          </div>
        ))}
        <div
          className="avatar-pop w-11 h-11 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-600 shrink-0"
          style={{ animationDelay: `${CREW.length * 0.12}s` }}
        >
          <Plus size={16} />
        </div>
      </div>
      <p className="mt-2.5 text-[11px] text-slate-500">
        {CREW.map((m) => m.name).join(', ')} + you
      </p>
    </div>
  )
}

function ExpensesList() {
  const total = EXPENSES.reduce((sum, e) => sum + Number(e.amount.slice(1)), 0)
  return (
    <div className="space-y-2">
      {EXPENSES.map((e, i) => (
        <div
          key={e.label}
          className="expense-row flex items-center gap-2.5 bg-slate-800/60 border border-slate-800 rounded-lg px-2.5 py-1.5"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <Avatar id={e.by} size="sm" />
          <span className="text-xs sm:text-sm text-slate-300 flex-1 truncate">{e.label}</span>
          <span className="text-xs sm:text-sm font-medium text-white">{e.amount}</span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs sm:text-sm">
        <span className="text-slate-500">Group total</span>
        <span className="font-semibold text-green-400">${total}</span>
      </div>
    </div>
  )
}

function SettleList() {
  return (
    <div className="space-y-2">
      {SETTLEMENTS.map((s, i) => (
        <div
          key={`${s.from}-${s.to}`}
          className="expense-row flex items-center gap-2 bg-slate-800/60 border border-slate-800 rounded-lg px-2.5 py-1.5"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <Avatar id={s.from} size="sm" />
          <ArrowRight size={13} className="text-green-500 shrink-0" />
          <Avatar id={s.to} size="sm" />
          <span className="text-xs sm:text-sm text-slate-400 flex-1">owes</span>
          <span className="text-xs sm:text-sm font-medium text-white">{s.amount}</span>
        </div>
      ))}
      <div className="flex items-center justify-center gap-1.5 pt-2.5 text-xs sm:text-sm font-medium text-green-400">
        <CheckCircle2 size={14} />
        Everyone's square
      </div>
    </div>
  )
}

function Connector({ index }) {
  return (
    <div className="flex items-center justify-center h-8 sm:h-10 self-center">
      <svg width="20" height="100%" viewBox="0 0 20 32" fill="none" className="overflow-visible">
        <line x1="10" y1="0" x2="10" y2="26" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
        <g>
          <animateMotion
            dur="1.8s"
            begin={`${index * 0.3}s`}
            repeatCount="indefinite"
            path="M10,0 L10,26"
          />
          <circle r="7" fill="#0f172a" stroke="#4ade80" strokeWidth="1.5" />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#4ade80"
            fontSize="9"
            fontWeight="700"
          >
            $
          </text>
        </g>
        <path d="M5 24L10 30L15 24" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
