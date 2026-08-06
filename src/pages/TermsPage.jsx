import { Link } from 'react-router'
import LegalLayout from '../components/legal/LegalLayout'

function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-white font-semibold text-base sm:text-lg mb-2">{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="August 6, 2026">
      <p>
        These Terms & Conditions ("Terms") govern your access to and use of splyt-it (the
        "Service"). By creating an account or otherwise using the Service, you agree to be bound
        by these Terms. If you do not agree, do not use the Service.
      </p>

      <Section heading="1. What splyt-it is">
        <p>
          splyt-it is a tool for tracking and splitting shared costs among a group — trips,
          dinners, gifts, and similar shared expenses — and for calculating who owes whom to
          settle a group's balances.
        </p>
        <p>
          <strong className="text-white">splyt-it does not move, hold, or transmit money.</strong>{' '}
          The Service only performs calculations and record-keeping. Any actual payment between
          users (cash, bank transfer, payment app, or otherwise) happens entirely outside the
          Service and is solely between the users involved. splyt-it is not a party to, and has no
          responsibility for, those payments.
        </p>
      </Section>

      <Section heading="2. Accounts">
        <p>
          You must provide accurate information when creating an account and are responsible for
          maintaining the confidentiality of your login credentials and for all activity that
          occurs under your account. Notify us promptly of any unauthorized use.
        </p>
      </Section>

      <Section heading="3. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Violate any applicable law or regulation;</li>
          <li>Defraud, harass, or mislead other users, or record expenses that did not occur;</li>
          <li>Upload malicious code or attempt to disrupt, probe, or gain unauthorized access to the Service;</li>
          <li>Scrape, resell, or misuse the Service or any data obtained through it; or</li>
          <li>Impersonate any person or entity, or misrepresent your affiliation with one.</li>
        </ul>
        <p>We may suspend or terminate accounts that violate these Terms.</p>
      </Section>

      <Section heading="4. Your content and data">
        <p>
          You retain ownership of the group, expense, and payment information you submit to the
          Service ("Your Content"). You grant us a limited license to store, process, and display
          Your Content solely to operate and improve the Service. You are responsible for the
          accuracy of Your Content and for having the right to share it with the group members you
          invite.
        </p>
      </Section>

      <Section heading="5. No financial or professional advice">
        <p>
          Settlement calculations are provided for convenience only and are not financial, tax, or
          legal advice. You are solely responsible for verifying amounts and for any payments made
          or received based on the Service's calculations.
        </p>
      </Section>

      <Section heading="6. Disclaimer of warranties">
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, NON-INFRINGEMENT, OR THAT THE SERVICE WILL BE ACCURATE, UNINTERRUPTED, OR
          ERROR-FREE. YOU USE THE SERVICE AT YOUR OWN RISK.
        </p>
      </Section>

      <Section heading="7. Limitation of liability">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, SPLYT-IT AND ITS OPERATORS WILL NOT BE LIABLE
          FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY
          LOSS OF FUNDS, PROFITS, OR DATA, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE OR
          ANY DISPUTE OR PAYMENT BETWEEN USERS — EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
          DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE WILL NOT EXCEED
          FIFTY U.S. DOLLARS ($50) OR THE AMOUNT YOU PAID US TO USE THE SERVICE IN THE PAST TWELVE
          MONTHS, WHICHEVER IS GREATER.
        </p>
      </Section>

      <Section heading="8. Disputes between users">
        <p>
          Disagreements about who owes what, or about payments made outside the Service, are
          solely between the users involved. splyt-it has no obligation to mediate, verify, or
          reimburse any such dispute.
        </p>
      </Section>

      <Section heading="9. Indemnification">
        <p>
          You agree to indemnify and hold splyt-it and its operators harmless from any claim,
          liability, or expense (including reasonable legal fees) arising from your use of the
          Service, Your Content, or your violation of these Terms.
        </p>
      </Section>

      <Section heading="10. Termination">
        <p>
          You may stop using the Service and delete your account at any time from{' '}
          <Link to="/account" className="text-green-400 hover:text-green-300">
            Account settings
          </Link>
          . We may suspend or terminate access to the Service for any user who violates these
          Terms or poses a risk to the Service or other users.
        </p>
      </Section>

      <Section heading="11. Changes to these Terms">
        <p>
          We may update these Terms from time to time. Continued use of the Service after a change
          takes effect constitutes acceptance of the revised Terms. We'll update the "Last
          updated" date above when changes are made.
        </p>
      </Section>

      <Section heading="12. Governing law">
        <p>
          These Terms are governed by the laws of the jurisdiction in which splyt-it operates,
          without regard to conflict-of-law principles, unless otherwise required by applicable
          local law.
        </p>
      </Section>

      <Section heading="13. Contact">
        <p>
          Questions about these Terms can be sent to the contact address listed on your account or
          in the app.
        </p>
      </Section>
    </LegalLayout>
  )
}
