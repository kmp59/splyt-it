export default {
  slug: 'expenses',
  title: 'Adding & Splitting Expenses',
  icon: 'Receipt',
  summary:
    'Log what was spent, choose who paid, and split it evenly, by exact amounts, or by percentage — then edit or delete it later.',
  keywords: [
    'expense',
    'expenses',
    'add expense',
    'edit expense',
    'delete expense',
    'split',
    'splitting',
    'equal split',
    'exact split',
    'percent split',
    'percentage',
    'paid by',
    'split with',
    'who owes',
    'share',
    'receipt',
    'cost',
    'bill',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        'An expense is any cost you log in a group — dinner, a hotel room, a gift, groceries, anything you split with your crew. Every expense records what it was for, how much it cost, who paid, and how it\'s divided among the group.',
        'You can split an expense evenly, type exact dollar amounts per person, or split it by percentage — whatever matches how the cost actually broke down.',
      ],
    },
    {
      heading: 'Adding an expense',
      steps: [
        'From the group\'s Expenses tab, tap "Add expense".',
        'Enter a description (e.g. "Dinner", "Airbnb", "Groceries").',
        'Enter the total amount.',
        'Choose who paid using the "Paid by" dropdown — search or scroll to find the member.',
        'Under "Split with", select which members should share the cost. At least one person must stay selected.',
        'Pick a split type — Equal, Exact, or Percent — and fill in the amounts or percentages if needed.',
        'Tap "Add expense" to save.',
      ],
    },
    {
      heading: 'The three split types',
      paragraphs: [
        'You can switch between split types any time before saving — the app remembers your entries for each.',
      ],
      bullets: [
        'Equal — divides the total evenly among everyone selected in "Split with". This is the default and needs no extra input.',
        'Exact — type a dollar amount for each selected person. The amounts must add up to the total, or the app will show an error telling you the difference.',
        'Percent — type a percentage for each selected person. The percentages must add up to 100%, or the app will show an error telling you the difference.',
      ],
      tips: [
        'Use Exact when someone ordered something pricier than everyone else, or Percent when you\'re dividing by agreed-upon shares (like 60/40 roommates).',
      ],
    },
    {
      heading: 'Viewing expense details',
      paragraphs: [
        'Tap any expense in the list to open its full details.',
      ],
      bullets: [
        'Who paid, and who added the expense (shown separately if it\'s a different person).',
        'The date the expense was logged.',
        'The split method used (Equal, Exact, or Percent).',
        'Each person\'s share amount, with a bar showing their portion relative to the total — the payer\'s row is marked "paid".',
      ],
    },
    {
      heading: 'Editing an expense',
      steps: [
        'Find the expense in the list and tap the pencil icon.',
        'Update the description, amount, payer, split members, or split type as needed.',
        'Tap "Save changes" to update it.',
      ],
      tips: [
        'Editing is open to anyone in the group, not just the person who paid or added it.',
      ],
    },
    {
      heading: 'Deleting an expense',
      paragraphs: [
        'Only the person who paid for an expense can delete it — the trash icon only appears on expenses you paid for.',
      ],
      steps: [
        'Find the expense you paid for in the list.',
        'Tap the trash icon.',
        'Confirm to remove it — this also removes it from the group\'s total and everyone\'s balances.',
      ],
    },
  ],
}
