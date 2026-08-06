import LegalLayout from '../components/legal/LegalLayout'

function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-white font-semibold text-base sm:text-lg mb-2">{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function CopyrightPage() {
  return (
    <LegalLayout title="Copyright & Intellectual Property" updated="August 6, 2026">
      <p>
        © {new Date().getFullYear()} splyt-it. All rights reserved.
      </p>

      <Section heading="Ownership">
        <p>
          The splyt-it name, logo, interface design, source code, and all associated text,
          graphics, and other materials (collectively, the "Materials") are the property of
          splyt-it or its licensors and are protected by copyright, trademark, and other
          intellectual property laws. Except for the limited license below, no rights to the
          Materials are granted to you.
        </p>
      </Section>

      <Section heading="Limited license">
        <p>
          You are granted a personal, non-exclusive, non-transferable, revocable license to access
          and use the Materials solely to use splyt-it for its intended purpose. You may not copy,
          modify, distribute, sell, lease, reverse-engineer, or create derivative works from the
          Materials, in whole or in part, without prior written permission.
        </p>
      </Section>

      <Section heading="Your content">
        <p>
          Group names, expense descriptions, and other information you enter remain yours. We
          claim no ownership over it — we only store and process it to provide the Service, as
          described in these terms.
        </p>
      </Section>

      <Section heading="Trademarks">
        <p>
          "splyt-it" and its logo are trademarks of splyt-it. Other product and company names
          mentioned in the Service may be trademarks of their respective owners and are used for
          identification purposes only. No affiliation or endorsement is implied.
        </p>
      </Section>

      <Section heading="Third-party software">
        <p>
          splyt-it is built using open-source and third-party software components, each governed
          by its own license. Use of those components does not grant any additional rights to the
          splyt-it Materials.
        </p>
      </Section>

      <Section heading="Reporting infringement">
        <p>
          If you believe content on splyt-it infringes your copyright or other intellectual
          property rights, contact us with (1) a description of the work you claim is infringed,
          (2) the location of the allegedly infringing material within the Service, and (3) your
          contact information. We will review and respond to valid notices in accordance with
          applicable law.
        </p>
      </Section>

      <Section heading="Unauthorized use">
        <p>
          Any use of the Materials not expressly permitted by these terms is a violation of our
          rights and may result in legal action. Unauthorized copying, redistribution, or
          commercial use of the Materials is strictly prohibited.
        </p>
      </Section>
    </LegalLayout>
  )
}
