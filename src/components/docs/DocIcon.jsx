import {
  LogIn,
  Settings,
  Users,
  ShieldPlus,
  RotateCcw,
  Receipt,
  Scale,
  CheckCircle,
  BookOpen,
} from 'lucide-react'

// Explicit allowlist — each doc's `icon` field must be one of these keys.
// Keeping this as a lookup (rather than dynamic lucide-react import) means a
// typo in a doc file fails loud (falls back to BookOpen) instead of crashing.
const ICONS = {
  LogIn,
  Settings,
  Users,
  ShieldPlus,
  RotateCcw,
  Receipt,
  Scale,
  CheckCircle,
  BookOpen,
}

export default function DocIcon({ name, ...props }) {
  const Icon = ICONS[name] ?? BookOpen
  return <Icon {...props} />
}
