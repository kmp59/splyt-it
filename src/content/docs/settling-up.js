export default {
  slug: 'settling-up',
  title: 'Settling Up',
  icon: 'CheckCircle',
  summary: 'See exactly who owes whom, choose how the debts are grouped, and record payments as they happen.',
  keywords: [
    'settle up',
    'settle',
    'settlement',
    'who pays whom',
    'simplified',
    'individual',
    'record payment',
    'pay',
    'debt',
    'balance',
    'archive group',
    'confetti',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        "Once expenses have been added to a group, someone almost always owes someone else money. The Settle Up modal turns those balances into a clear \"who pays whom\" list, so nobody has to do the math themselves.",
        "You open it from the group page by tapping \"Settle up.\" From there you can switch between two ways of viewing the debts, and mark payments as done once they've actually happened.",
      ],
    },
    {
      heading: 'Opening Settle Up',
      steps: [
        'Go to the group you want to settle.',
        'Tap the "Settle up" button on the group page.',
        'Review the list under "Who pays whom" — each row shows one person paying another a specific amount.',
        'If every balance is already at zero, you\'ll see an "Everyone is settled up!" message instead of a list.',
      ],
    },
    {
      heading: 'Simplified vs. Individual',
      paragraphs: [
        'At the top of the list is a toggle with two modes. Both show accurate debts, but they organize them differently.',
      ],
      bullets: [
        '"Simplified" nets everyone\'s overall balance against the whole group and works out the smallest possible set of payments to clear all debts. This can mean someone pays a person they didn\'t directly split an expense with, because it\'s the most efficient way to zero everyone out.',
        '"Individual" shows the direct, pairwise debt between each specific pair of people — what A owes B and what B owes A are netted against each other, but debts are not simplified across the wider group. This mirrors exactly who owes whom based on the actual expenses.',
        'Switching the toggle only changes how the same underlying balances are grouped and displayed — it doesn\'t change anyone\'s actual balance.',
      ],
      tips: [
        'Use "Simplified" when you just want the fewest number of payments to make.',
        'Use "Individual" when you want to see the direct debt tied to a specific person, expense-by-expense logic and all.',
      ],
    },
    {
      heading: 'Recording a payment',
      steps: [
        'Find the row for the payment that actually happened (for example, you paid a friend back in cash or over Venmo).',
        'Tap "Record payment" on that row.',
        'The row updates to show a "Paid" badge, with a little confetti celebration to mark the occasion.',
        'That payment is now factored into everyone\'s balance — it will be reflected in the settlement list from then on, in both Simplified and Individual views.',
      ],
      tips: [
        "Splyt-it only records that a payment took place — it doesn't move real money. You'll still need to actually pay each other outside the app, using cash, Venmo, a bank transfer, or whatever works for your group.",
      ],
    },
    {
      heading: 'Archiving a fully settled group',
      paragraphs: [
        'Once every member\'s balance is exactly zero, an "Archive group" button appears at the bottom of the Settle Up modal. This is a quick way to close out a group once all debts are cleared.',
        'For details on what archiving does and how to manage archived groups, see the "Group Lifecycle" help doc.',
      ],
    },
  ],
}
