// Registry of per-doc diagrams. Not every doc has one — a diagram was only
// added where it shows a real mechanism (branching flow, state machine,
// comparison, or transformation) beyond what the prose already covers.
// See DocPage.jsx for how this is rendered.

import GettingStartedDiagram from './getting-started'
import GroupsDiagram from './groups'
import RolesAndPermissionsDiagram from './roles-and-permissions'
import GroupLifecycleDiagram from './group-lifecycle'
import ExpensesSplitDiagram from './expenses'
import BalancesAndSpendingDiagram from './balances-and-spending'
import SettlingUpDiagram from './settling-up'

export const docDiagrams = {
  'getting-started': GettingStartedDiagram,
  groups: GroupsDiagram,
  'roles-and-permissions': RolesAndPermissionsDiagram,
  'group-lifecycle': GroupLifecycleDiagram,
  expenses: ExpensesSplitDiagram,
  'balances-and-spending': BalancesAndSpendingDiagram,
  'settling-up': SettlingUpDiagram,
  // account-settings intentionally has none — two independent linear forms,
  // nothing branching/stateful/comparative to diagram.
}
