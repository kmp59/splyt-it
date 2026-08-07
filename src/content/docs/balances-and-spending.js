export default {
  slug: 'balances-and-spending',
  title: 'Balances & Spending',
  icon: 'Scale',
  summary: 'See who has paid the most in a group, and check your own balance — whether you\'re owed money, owe money, or you\'re all settled up.',
  keywords: [
    'balances',
    'spending',
    'who owes who',
    'who owes what',
    'settle up',
    'net balance',
    'owed',
    'owe',
    'settled up',
    'group tabs',
    'group balance',
    'expenses tab',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        'Every group has three tabs at the top: Expenses, Spending, and Balances. Expenses is the running list of everything logged in the group. Spending and Balances give you two different views of the same money — the first shows who has fronted the most cash, the second shows who actually owes who once everyone\'s fair share is factored in.',
        'Both tabs update automatically as expenses are added, edited, or deleted, so you\'re always looking at a live picture of the group\'s money.',
      ],
    },
    {
      heading: 'Check who has paid the most (Spending tab)',
      steps: [
        'Open a group and tap the "Spending" tab.',
        'Members are ranked from the highest total paid to the lowest.',
        'Each row shows the total dollar amount that member has personally paid across all expenses in the group — not their fair share, just what they fronted.',
        'Your own row is highlighted so you can spot it at a glance.',
      ],
      bullets: [
        'This is a simple leaderboard of who\'s been covering the bills — it doesn\'t account for what each person actually owes.',
        'If no expenses have been added yet, the tab shows an empty state instead of a list.',
      ],
    },
    {
      heading: 'Check who owes what (Balances tab)',
      paragraphs: [
        'The Balances tab tells you the real story: after every expense is split fairly and every recorded payment is applied, who is still ahead and who is still behind.',
      ],
      steps: [
        'Open a group and tap the "Balances" tab.',
        'At the top, a summary card shows your own net balance for the group.',
        'Below that, a grid shows every member\'s individual balance so you can see the full picture, not just your own.',
      ],
      bullets: [
        'Green "You\'re owed" means people in the group owe you money overall.',
        'Orange "You owe" means you owe money to others in the group overall.',
        '"You\'re settled up" means your balance nets out to zero.',
        'In the member grid, a green number means that person is owed money by the group; an orange number means that person owes money to the group.',
      ],
    },
    {
      heading: 'How a balance is calculated',
      paragraphs: [
        'A member\'s balance is simply what they\'ve paid for, minus their share of everything they were included in, adjusted for any payments already recorded between members.',
      ],
      bullets: [
        'Every dollar a member pays for an expense adds to their balance.',
        'Every dollar of an expense that\'s assigned as their share subtracts from their balance.',
        'Recorded payments between members shift balances too — paying someone back raises your balance and lowers theirs by that amount.',
        'A positive balance means the group owes that person money; a negative balance means that person owes the group money.',
      ],
      tips: [
        'The Balances tab is purely informational — it shows you where things stand, but it doesn\'t move any money.',
        'To actually record a payoff between members, use the separate Settle Up flow.',
      ],
    },
    {
      heading: 'No expenses yet',
      paragraphs: [
        'If a group has no expenses, both the Spending and Balances tabs show a friendly empty state instead of numbers. Add your first expense from the Expenses tab and both views will populate right away.',
      ],
    },
  ],
}
