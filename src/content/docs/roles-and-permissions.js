export default {
  slug: 'roles-and-permissions',
  title: 'Roles & Permissions',
  icon: 'ShieldPlus',
  summary: 'Learn how group ownership and admin roles work in Splyt, and how to remove members, leave a group, or merge a guest into a real account.',
  keywords: [
    'roles',
    'permissions',
    'admin',
    'owner',
    'creator',
    'promote',
    'demote',
    'remove member',
    'leave group',
    'kick member',
    'merge guest',
    'guest',
    'settle up',
    'balance',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        "Every group in Splyt has one owner — the person who created it — plus any number of admins the owner promotes along the way. Roles control who can manage the group's membership: promoting or demoting admins, removing members, and merging guest accounts into real ones.",
        "You don't need any special role to add expenses, record payments, or invite new members — roles only come into play for member management.",
      ],
    },
    {
      heading: 'The group owner',
      paragraphs: [
        'The owner is whoever created the group. This role is permanent — it can\'t be transferred, and the owner can never be removed from the group or demoted, even by another admin.',
      ],
      bullets: [
        'The owner is automatically treated as an admin, so they can do everything an admin can do.',
        'Only the owner can promote another member to admin.',
        "A small \"owner\" badge next to their name in the Members list marks who it is.",
      ],
    },
    {
      heading: 'Promoting and demoting admins',
      paragraphs: [
        'Admins get the same member-management powers as the owner, minus the ability to promote new admins. This lets you share the workload of running a group without handing over full ownership.',
      ],
      steps: [
        'Open the group and find the member in the Members list.',
        'As the owner, tap the shield-plus icon next to a member\'s name to make them an admin.',
        'To remove admin rights, the owner or any current admin can tap the shield-minus icon next to an admin\'s name — including on themselves, to step down.',
      ],
      tips: [
        "Promoting is limited to the owner on purpose — it's a deliberate, single point of trust. Demoting is looser, so any admin can undo a bad promotion quickly.",
        'Guests can\'t be promoted to admin, since they don\'t have a login to act with.',
      ],
    },
    {
      heading: 'Removing a member or leaving a group',
      paragraphs: [
        'Members can leave a group themselves, and the owner can remove other members. Either way, Splyt blocks the action if the person has an outstanding balance.',
      ],
      steps: [
        'Make sure the member\'s balance is settled to $0 — if they owe money or are owed money, settle up first.',
        'Tap the remove icon (person with a minus sign) next to their name in the Members list.',
        'Confirm the removal, or confirm "Leave this group?" if you\'re removing yourself.',
      ],
      bullets: [
        'The group owner can never be removed and can\'t leave the group.',
        'You can\'t remove the last remaining member of a group.',
        'Member management is turned off once a group is archived.',
      ],
    },
    {
      heading: 'Merging a guest into a real member',
      paragraphs: [
        'Guests are placeholder members added without an account — handy for splitting costs with someone who hasn\'t signed up yet. Once that person joins the group for real, an admin can merge the guest into their real membership so all the history lines up under one name.',
      ],
      steps: [
        'Have the real person join the group as a proper member.',
        'Find the guest in the Members list — they\'re marked with a "guest" badge.',
        'Tap the swap-arrows icon next to the guest\'s name.',
        'Choose the real member to merge them into, then confirm.',
      ],
      tips: [
        "Merging moves all of the guest's expenses and payments onto the real member and removes the guest from the group — this can't be undone, so double-check you're merging into the right person before confirming.",
        'Only admins (and the owner) can merge guests.',
      ],
    },
  ],
}
