export default {
  slug: 'getting-started',
  title: 'Getting Started',
  icon: 'LogIn',
  summary:
    'How to create a splyt-it account, sign in, and recover access if you forget your password.',
  keywords: [
    'getting started',
    'sign up',
    'signup',
    'create account',
    'sign in',
    'login',
    'log in',
    'password',
    'forgot password',
    'reset password',
    'reset link',
    'email',
    'account',
    'auth',
    'demo mode',
  ],
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        "Splyt-it is where you and your crew keep track of shared costs — trips, dinners, gifts, anything you split. To use it you'll need an account, since your groups and expenses are tied to you.",
        'This page covers the three things you need before you can do anything else in the app: creating an account, signing in, and resetting your password if you forget it.',
      ],
    },
    {
      heading: 'Creating an account',
      steps: [
        "Go to the sign-up page (there's a \"Create one\" link at the bottom of the sign-in page if you're already there).",
        'Enter your name — this is what other members of your groups will see.',
        'Enter your email address.',
        'Choose a password that is at least 6 characters long.',
        'Submit the form. You\'ll be signed in automatically and taken to your dashboard.',
      ],
      bullets: [
        "If the email you entered is already registered, you'll see a message saying an account already exists for it.",
        "Passwords shorter than 6 characters are rejected — you'll be asked to choose a longer one.",
      ],
    },
    {
      heading: 'Signing in',
      steps: [
        'Go to the sign-in page.',
        'Enter the email and password you signed up with.',
        'Submit the form to be taken straight to your dashboard.',
      ],
      bullets: [
        "If your email or password doesn't match an account, you'll see a generic \"Invalid email or password\" message rather than details about which field was wrong.",
        "After too many failed attempts in a row, you'll be asked to wait before trying again.",
      ],
    },
    {
      heading: 'Resetting a forgotten password',
      steps: [
        'From the sign-in page, click "Forgot password?" next to the password field.',
        'Enter the email address associated with your account.',
        'Submit the form to request a reset link.',
        "Check your email for a message with a link to set a new password.",
      ],
      tips: [
        "The confirmation message (\"If an account exists for this email, we've sent a link to reset your password\") is shown whether or not that email actually has an account. This is intentional — it keeps anyone from using the reset form to check which emails are registered.",
      ],
    },
    {
      heading: 'Staying signed in',
      paragraphs: [
        'Almost everything in splyt-it — your dashboard, groups, and expenses — requires you to be signed in. If you try to visit one of those pages without an active session, you\'ll be redirected to the sign-in page automatically.',
        "Once you're signed in, you'll stay signed in as you navigate the app until you sign out.",
      ],
    },
    {
      heading: 'A note on local demo mode',
      paragraphs: [
        'Some deployments of splyt-it run in a local demo mode, meant for trying the app out without a real backend.',
      ],
      tips: [
        'In local mode, the sign-in form comes pre-filled with demo credentials, and you can sign up with any email and password you like — everything is stored only in your browser rather than a real account.',
      ],
    },
  ],
}
