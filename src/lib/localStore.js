// Minimal localStorage helper with in-memory pub-sub so local subscriptions
// behave like Firestore onSnapshot (same-tab change notification).

const listeners = new Map() // key → Set<() => void>

export function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  notify(key)
}

export function lsSubscribe(key, cb) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(cb)
  return () => listeners.get(key)?.delete(cb)
}

function notify(key) {
  listeners.get(key)?.forEach((cb) => cb())
}

export function lsId() {
  return Math.random().toString(36).slice(2, 10)
}
