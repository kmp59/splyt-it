// Aggregates every feature doc into one ordered list, plus a short overall
// app summary shown at the top of the /docs index page. Each entry is a
// plain data module — see any file in this directory for the shared shape:
// { slug, title, icon, summary, keywords, sections: [{ heading, paragraphs?, steps?, bullets?, tips? }] }

import gettingStarted from './getting-started'
import accountSettings from './account-settings'
import groups from './groups'
import rolesAndPermissions from './roles-and-permissions'
import groupLifecycle from './group-lifecycle'
import expenses from './expenses'
import balancesAndSpending from './balances-and-spending'
import settlingUp from './settling-up'

export const docs = [
  gettingStarted,
  accountSettings,
  groups,
  rolesAndPermissions,
  groupLifecycle,
  expenses,
  balancesAndSpending,
  settlingUp,
]

export const appSummary = {
  title: 'splyt-it docs',
  tagline: 'Split any cost with your crew in seconds.',
  paragraphs: [
    'splyt-it is a lightweight expense-splitting app for trips, dinners, gifts, and anything else a group pays for together. Create a group, invite the people involved (or add them as guests if they don’t have an account), log expenses as they happen, and splyt-it keeps a running tally of who paid for what and who owes whom.',
    'It only tracks numbers — it never moves real money. When a group is ready to settle up, splyt-it works out the simplest set of payments to zero everyone’s balance, and lets you record each payment once it’s actually been made (by cash, Venmo, or however your group prefers).',
  ],
}

export function getDocBySlug(slug) {
  return docs.find((d) => d.slug === slug)
}

// Flattens every section's text into one lowercase blob per doc so search
// can match content, not just the title/summary/keywords.
function flattenText(doc) {
  const parts = [doc.title, doc.summary, ...(doc.keywords ?? [])]
  for (const section of doc.sections ?? []) {
    parts.push(section.heading)
    parts.push(...(section.paragraphs ?? []))
    parts.push(...(section.steps ?? []))
    parts.push(...(section.bullets ?? []))
    parts.push(...(section.tips ?? []))
  }
  return parts.filter(Boolean).join(' \n ').toLowerCase()
}

const searchIndex = docs.map((doc) => ({ doc, text: flattenText(doc) }))

// Simple, dependency-free search: every whitespace-separated term in the
// query must appear somewhere in the doc's flattened text. Title/summary/
// keyword matches are weighted higher so the most relevant doc sorts first.
export function searchDocs(query) {
  const q = query.trim().toLowerCase()
  if (!q) return docs

  const terms = q.split(/\s+/).filter(Boolean)

  const scored = searchIndex
    .map(({ doc, text }) => {
      if (!terms.every((t) => text.includes(t))) return null
      let score = 0
      const titleLower = doc.title.toLowerCase()
      const summaryLower = doc.summary.toLowerCase()
      const keywordsLower = (doc.keywords ?? []).map((k) => k.toLowerCase())
      for (const t of terms) {
        if (titleLower.includes(t)) score += 5
        if (keywordsLower.some((k) => k.includes(t))) score += 3
        if (summaryLower.includes(t)) score += 2
        score += 1 // base credit for the body-text match already required above
      }
      return { doc, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

  return scored.map((s) => s.doc)
}
