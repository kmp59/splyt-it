export default {
  slug: 'account-settings',
  title: 'Account Settings',
  icon: 'Settings',
  summary:
    'Update the display name your group members see and change your account password from the Account page.',
  keywords: [
    'account',
    'settings',
    'profile',
    'display name',
    'username',
    'change name',
    'rename',
    'password',
    'change password',
    'update password',
    'reset password',
    'current password is incorrect',
    'security',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        "Your Account page is where you manage your personal details: the name your group members see, and your account password. You can get there anytime by clicking your avatar in the nav bar.",
        'Changes you make here apply across every group and trip you\'re part of — there\'s no need to update anything per-group.',
      ],
    },
    {
      heading: 'Changing your display name',
      steps: [
        "Click your avatar in the nav bar, then select Account.",
        'Under "Username," edit the Display name field.',
        'Click Save name to confirm.',
      ],
      bullets: [
        "This is the name your group members see everywhere in Splyt — in group member lists, expense splits, and activity.",
        'The Save name button stays disabled until you enter a name that\'s different from your current one.',
        "You'll see a confirmation toast once your name has been updated.",
      ],
    },
    {
      heading: 'Changing your password',
      steps: [
        'Click your avatar in the nav bar, then select Account.',
        'Under "Change password," enter your current password.',
        'Enter your new password, then re-enter it in the Confirm new password field.',
        'Click Update password to save the change.',
      ],
      bullets: [
        'Your new password must be at least 6 characters long.',
        'The new password and confirmation must match exactly.',
        "You'll need to correctly enter your current password before a new one can be set — this protects your account if someone else has access to your device.",
      ],
      tips: [
        'Use a password you don\'t use anywhere else, and consider a password manager to keep track of it.',
        'After a successful update, both password fields are cleared automatically — you don\'t need to sign in again.',
      ],
    },
    {
      heading: 'Troubleshooting common errors',
      paragraphs: [
        "If something goes wrong while updating your password, Splyt shows a plain-English error message so you know what to fix.",
      ],
      bullets: [
        '"Current password is incorrect." — The current password you entered doesn\'t match your account. Double-check for typos or Caps Lock.',
        '"New password must be at least 6 characters." — Choose a longer password and try again.',
        '"New passwords do not match." — The New password and Confirm new password fields need to be identical.',
        '"Too many attempts. Try again later." — Splyt temporarily blocks further tries after repeated failed attempts. Wait a bit before trying again.',
        '"New password is too weak." — Pick a stronger password, ideally mixing letters, numbers, and symbols.',
        '"Something went wrong. Please try again." — A general error occurred; try again, and check your connection if it persists.',
      ],
    },
  ],
}
