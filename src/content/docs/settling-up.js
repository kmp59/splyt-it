export default {
  slug: 'settling-up',
  title: 'Settling Up',
  icon: 'CheckCircle',
  summary: 'Your group gets one fixed settlement plan when the trip is completed. Record payments against it as they happen.',
  keywords: [
    'settle up',
    'settle',
    'settlement',
    'settlement plan',
    'who pays whom',
    'record payment',
    'paid by',
    'on behalf',
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
        "Once expenses have been added to a group, someone almost always owes someone else money. When the trip is completed, splyt-it works out a settlement plan — the smallest set of payments that clears everyone's balance — and saves it to the group.",
        "The saved plan never changes. Recording a payment just marks its row as paid; nobody else's rows move, so everyone can rely on the amounts they were given.",
      ],
    },
    {
      heading: 'Opening Settle Up',
      steps: [
        'Go to the group you want to settle and make sure the trip is completed ("Complete trip").',
        'Tap the "Settle up" button on the group page.',
        'Review the settlement plan — each row shows one person paying another a specific amount, and when the plan was saved.',
      ],
    },
    {
      heading: 'Recording a payment',
      steps: [
        'Find the row for the payment that actually happened (for example, you paid a friend back in cash or over Venmo).',
        'Tap "Record payment" on that row.',
        'Under "Who paid?", leave the person who owed selected — or, if someone else covered it for them, pick that person instead.',
        'Tap "Confirm payment". The row shows a "Paid" badge (and who paid, if it was someone else), with a little confetti to mark the occasion.',
        'The payment also shows up in the group\'s expense list, with who paid whom and when.',
      ],
      tips: [
        "Splyt-it only records that a payment took place — it doesn't move real money. You'll still need to actually pay each other outside the app, using cash, Venmo, a bank transfer, or whatever works for your group.",
        'When someone pays on another person\'s behalf, the row still counts as paid for the person who owed. Anything between the two of them is theirs to sort out outside the group.',
      ],
    },
    {
      heading: 'Expenses added after the plan was saved',
      paragraphs: [
        'You can still add or edit expenses after completing a trip. The saved plan stays exactly as it was; any difference shows up in its own "Added after the plan was saved" section, with rows you can pay the same way.',
      ],
    },
    {
      heading: 'Other payments',
      paragraphs: [
        'A payment that doesn\'t match any row in the plan (for example, one recorded before plans were saved) is listed under "Other payments". It stays on record but doesn\'t mark anything in the plan as paid.',
      ],
    },
    {
      heading: 'Archiving a fully settled group',
      paragraphs: [
        'Once every row in the plan is paid, an "Archive group" button appears at the bottom of the Settle Up modal. This is a quick way to close out a group once all debts are cleared.',
        'For details on what archiving does and how to manage archived groups, see the "Group Lifecycle" help doc.',
      ],
    },
  ],
}
