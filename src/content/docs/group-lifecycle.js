export default {
  slug: 'group-lifecycle',
  title: 'Group Lifecycle',
  icon: 'RotateCcw',
  summary: 'A group moves through active, settling up, and archived states — learn how to complete a trip, archive it once everyone is squared away, and reopen it later if needed.',
  keywords: [
    'group lifecycle',
    'complete trip',
    'archive',
    'archive group',
    'reopen',
    'reopen trip',
    'settling up',
    'settle up',
    'archived groups',
    'active groups',
    'trip status',
    'group status',
    'wrap up',
    'close group',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        "Every group in Splyt is in one of three states: active, settling up, or archived. New groups start out active, which means members can freely add expenses and the group behaves normally.",
        "When a trip or event wraps up, you move it through wrap-up mode (\"settling up\") and then archive it once every balance hits zero. Archiving isn't permanent — you can reopen a group at any time to bring it back to active.",
      ],
    },
    {
      heading: 'Completing a trip',
      steps: [
        "Open the group and tap \"Complete trip\" (this button only appears once the group has at least one expense).",
        "The group immediately switches into wrap-up mode, and an amber \"settling up\" badge appears next to the group name.",
        "You can still add new expenses and use Settle Up while a group is settling up — completing a trip doesn't lock the numbers, it just signals that you're wrapping things up.",
      ],
    },
    {
      heading: 'Archiving a group',
      paragraphs: [
        "Archiving is the final step, and it's only available once every member's balance is exactly zero — in other words, everyone owes nothing and is owed nothing.",
      ],
      steps: [
        "From a group that's settling up, tap \"Settle up\" to open the Settle Up modal.",
        "Record any remaining payments shown under \"Who pays whom\" until everyone is settled up.",
        "Once all balances read zero, the \"Archive group\" button becomes available inside the Settle Up modal — tap it and confirm.",
        "The group now shows a gray \"archived\" badge and moves out of your active groups list.",
      ],
      tips: [
        "The \"Archive group\" button stays disabled until every member's balance is settled — if you don't see it, someone still owes (or is owed) money.",
      ],
    },
    {
      heading: 'Reopening an archived group',
      paragraphs: [
        "Archiving a group doesn't delete anything — all expenses and history stay intact, and you can bring the group back whenever you need to.",
      ],
      steps: [
        "Open the archived group.",
        "Tap \"Reopen trip.\"",
        "The group returns to the active state immediately, ready for new expenses again.",
      ],
    },
    {
      heading: 'Where to find each state',
      paragraphs: [
        "Your dashboard keeps active and archived groups visually separate so archived trips don't clutter your everyday list.",
      ],
      bullets: [
        "Active groups (including ones that are settling up) appear in your main \"Groups\" list, with a \"settling up\" badge if a trip has been completed but not yet archived.",
        "Archived groups are tucked into a separate, collapsed \"Archive\" section further down the dashboard.",
        "You can tap into an archived group from that section at any time to view its history or reopen it.",
      ],
    },
  ],
}
