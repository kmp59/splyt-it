export default {
  slug: 'groups',
  title: 'Creating & Joining Groups',
  icon: 'Users',
  summary:
    'How to create a group, invite people by email or search, join a group by ID, and add guests who don\'t have an account.',
  keywords: [
    'groups',
    'create group',
    'new group',
    'join group',
    'group id',
    'invite',
    'invites',
    'pending invite',
    'accept invite',
    'decline invite',
    'members',
    'add member',
    'guest',
    'add guest',
    'contacts',
    'email',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        "Groups are where splyt-it keeps track of shared costs — a trip, a dinner club, a gift pool, anything you're splitting with other people. Every expense you add belongs to a group, and everyone in the group can see what's been spent and who owes what.",
        "You can create your own group and invite people into it, join a group someone else created by pasting its group ID, or add a guest for someone who won't be signing up for an account.",
      ],
    },
    {
      heading: 'Creating a group',
      steps: [
        'From your dashboard, click "New group".',
        'Give the group a name, like "Cabo Trip" or "Dinner Club".',
        "Optionally invite members: start typing a name or email in the \"Invite members\" field. If the person shares a group with you already, they'll show up as a suggestion you can click to add.",
        "If they're not a suggestion, type their exact email address and click \"Add\".",
        'Click "Create group" to finish.',
      ],
      bullets: [
        "Suggestions are drawn only from people you already share a group with — splyt-it can't search all users, so anyone new to you needs to be added by their exact email.",
        'People you invite this way show up in the group as "pending" until they accept.',
      ],
    },
    {
      heading: 'Joining a group by ID',
      paragraphs: [
        "If someone shares a group's ID with you directly, you can join it without waiting for an email invite.",
      ],
      steps: [
        'On your dashboard, find the "Join a group by ID" field.',
        'Paste the group ID you were given.',
        'Click "Join" to be added to the group and taken straight to it.',
      ],
      tips: [
        "If the ID is wrong or the group can't be joined, you'll see an error — double-check the ID with whoever shared it.",
      ],
    },
    {
      heading: 'Accepting or declining an invite',
      paragraphs: [
        "When someone invites you to a group by email, you'll see it as a card on your dashboard under \"Invites\" the next time you sign in — it won't show up in your groups list until you respond.",
      ],
      steps: [
        'Go to your dashboard.',
        'Find the group under the "Invites" section.',
        'Click "Accept" to join the group and open it, or "Decline" to turn down the invite.',
      ],
    },
    {
      heading: 'Adding members and guests to an existing group',
      paragraphs: [
        "Once a group exists, open it and use \"Add member\" in the Members section. You can add someone two ways: by email, which sends them a pending invite just like at group creation, or as a guest.",
        "A guest is someone without a splyt-it account — handy for people who won't be signing up but still need to be included in the splitting. Give them a display name and they're added immediately, no invite or acceptance needed. Guests are marked with a \"guest\" badge next to their name so it's clear they can't sign in.",
      ],
      bullets: [
        "Members added by email appear as \"pending\" until they accept, just like invites sent when the group was created.",
        "Managing guests further — like merging a guest into a real account once they sign up — is covered in the Roles & Permissions doc.",
      ],
    },
  ],
}
