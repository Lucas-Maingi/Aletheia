import { LegalPageLayout, type LegalSection } from "@/components/landing/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Aletheia",
  description: "Terms of Service for Aletheia, the OSINT intelligence platform. Acceptable use, lifetime deal terms, and liability.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    legalText: (
      <>
        <p>
          By accessing, browsing, or using the Aletheia platform
          (&quot;Service&quot;), including any associated websites, APIs,
          browser extensions, and mobile applications operated by Aletheia
          Intelligence (&quot;Aletheia&quot;, &quot;we&quot;, &quot;us&quot;,
          or &quot;our&quot;), you acknowledge that you have read, understood,
          and agree to be bound by these Terms of Service (&quot;Terms&quot;).
        </p>
        <p className="mt-4">
          If you are using the Service on behalf of an organization, you
          represent and warrant that you have the authority to bind that
          organization to these Terms. If you do not agree to these Terms, you
          must not access or use the Service.
        </p>
        <p className="mt-4">
          We reserve the right to modify these Terms at any time. Material
          changes will be communicated via email or in-platform notification at
          least 30 days before they take effect. Continued use of the Service
          after such notice constitutes acceptance of the updated Terms.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          By using Aletheia, you agree to these terms. If you&apos;re using it
          for your company, you need the authority to agree on their behalf.
        </p>
        <p>
          We&apos;ll give you 30 days heads-up before any changes to these
          terms.
        </p>
      </>
    ),
  },
  {
    id: "service-description",
    title: "2. Service Description",
    legalText: (
      <>
        <p>
          Aletheia is an Open Source Intelligence (OSINT) platform that
          aggregates, correlates, and analyzes publicly available information
          to generate actionable intelligence reports. The Service includes:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            Multi-source intelligence aggregation from public APIs, search
            engines, domain registries, breach notification databases, and
            other open-source data repositories.
          </li>
          <li>
            AI-powered entity extraction, relationship mapping, and risk
            assessment using Google Gemini large language models.
          </li>
          <li>
            Evidence management with SHA-256 cryptographic hashing for
            provenance and chain-of-custody integrity.
          </li>
          <li>
            Investigation workspace with collaborative analysis tools,
            timeline reconstruction, and entity graph visualization.
          </li>
        </ul>
        <p className="mt-4">
          The Service is designed for professional OSINT analysts, cybersecurity
          researchers, compliance officers, journalists, legal investigators,
          and other professionals engaged in lawful intelligence gathering.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Aletheia is a professional OSINT platform. It gathers public data,
          uses AI to analyze it, and gives you intelligence reports with
          cryptographic evidence hashing.
        </p>
        <p>Built for analysts, researchers, and investigators.</p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable Use",
    legalText: (
      <>
        <p>
          You agree to use the Service only for lawful, ethical, and authorized
          purposes. Acceptable uses include, but are not limited to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>Legitimate security research and vulnerability disclosure.</li>
          <li>Corporate due diligence and compliance investigations.</li>
          <li>Journalistic investigation and open-source reporting.</li>
          <li>Law enforcement investigations conducted with proper authority.</li>
          <li>Fraud detection and prevention.</li>
          <li>Personal digital footprint assessment and privacy auditing.</li>
          <li>Academic research on publicly available datasets.</li>
        </ul>
        <p className="mt-4">
          You are solely responsible for ensuring that your use of the Service
          complies with all applicable local, state, national, and
          international laws and regulations, including but not limited to data
          protection laws (GDPR, CCPA), anti-stalking statutes, and
          computer fraud and abuse laws.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Use Aletheia for security research, compliance, journalism, fraud
          detection, due diligence, and other legitimate purposes.
        </p>
        <p>
          You&apos;re responsible for making sure your use is legal in your
          jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: "prohibited-activities",
    title: "4. Prohibited Activities",
    legalText: (
      <>
        <p>
          The following activities are strictly prohibited and constitute
          grounds for immediate account termination without refund:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            <strong className="text-white">Harassment &amp; Stalking:</strong>{" "}
            Using the Service to harass, stalk, threaten, intimidate, or dox
            any individual.
          </li>
          <li>
            <strong className="text-white">Illegal Surveillance:</strong>{" "}
            Conducting surveillance of individuals without lawful authority or
            in violation of applicable privacy laws.
          </li>
          <li>
            <strong className="text-white">Unauthorized Access:</strong>{" "}
            Using the Service to bypass authentication mechanisms, exploit
            vulnerabilities, or gain unauthorized access to any computer
            system, network, or data.
          </li>
          <li>
            <strong className="text-white">Data Resale:</strong> Reselling,
            redistributing, or sublicensing intelligence reports, raw data
            outputs, or any data obtained through the Service without prior
            written authorization.
          </li>
          <li>
            <strong className="text-white">Automated Abuse:</strong>{" "}
            Automated scraping, crawling, or extraction of data from the
            Service beyond fair use and rate limits, or circumventing rate
            limits through any means.
          </li>
          <li>
            <strong className="text-white">Illegal Purposes:</strong> Using
            the Service for any purpose that violates applicable law,
            including identity theft, fraud, or discrimination.
          </li>
          <li>
            <strong className="text-white">Reverse Engineering:</strong>{" "}
            Decompiling, reverse engineering, or attempting to derive the
            source code of proprietary components of the Service.
          </li>
        </ul>
      </>
    ),
    summary: (
      <>
        <p>
          Don&apos;t use Aletheia for stalking, harassment, illegal
          surveillance, hacking, data resale, or anything unlawful.
        </p>
        <p className="font-semibold text-purple-300">
          Violations = immediate account termination, no refund.
        </p>
      </>
    ),
  },
  {
    id: "account-responsibilities",
    title: "5. Account Responsibilities",
    legalText: (
      <>
        <p>
          <strong className="text-white">5.1 Accurate Information.</strong> You
          agree to provide accurate, current, and complete information during
          registration and to keep your account information updated. Accounts
          created with false or misleading information may be terminated.
        </p>
        <p className="mt-4">
          <strong className="text-white">5.2 Credential Security.</strong> You
          are solely responsible for maintaining the confidentiality of your
          account credentials and for all activities that occur under your
          account. You must immediately notify us at{" "}
          <a
            href="mailto:legal@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            legal@aletheia.io
          </a>{" "}
          if you suspect any unauthorized access to your account.
        </p>
        <p className="mt-4">
          <strong className="text-white">5.3 Age Requirement.</strong> You must
          be at least 18 years of age, or the age of legal majority in your
          jurisdiction, to create an account and use the Service.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Use real info when signing up. Keep your password secure. If you
          think someone got into your account, let us know immediately.
        </p>
        <p>You must be 18+ to use Aletheia.</p>
      </>
    ),
  },
  {
    id: "payment-terms",
    title: "6. Payment & Lifetime Deal Terms",
    legalText: (
      <>
        <p>
          <strong className="text-white">6.1 Payment Processing.</strong> All
          payments are processed through Gumroad as our Merchant of Record.
          Prices are displayed in USD and are inclusive of applicable platform
          fees. Gumroad may collect applicable sales tax or VAT based on your
          location.
        </p>
        <p className="mt-4">
          <strong className="text-white">6.2 Refund Policy.</strong> We offer a
          30-day money-back guarantee on all initial purchases. If you are
          unsatisfied with the Service within the first 30 days, contact{" "}
          <a
            href="mailto:legal@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            legal@aletheia.io
          </a>{" "}
          for a full refund. After the 30-day period, all sales are final.
        </p>
        <p className="mt-4 p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
          <strong className="text-purple-400">
            6.3 Lifetime Deal Definition.
          </strong>{" "}
          &quot;Lifetime&quot; means the operational lifetime of the Aletheia
          platform. If the Service is discontinued, lifetime members will
          receive 12 months advance notice and a full data export in a
          structured, machine-readable format. Lifetime access entitles you to
          all features and updates available to your purchased tier for the
          duration of the platform&apos;s operation.
        </p>
        <p className="mt-4">
          <strong className="text-white">6.4 Feature Changes.</strong> We
          reserve the right to modify, add, or remove features of the Service.
          However, lifetime deal holders will not lose access to core
          functionality categories that were available at the time of their
          purchase.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Payments go through Gumroad. You get a 30-day money-back guarantee.
          After that, sales are final.
        </p>
        <p className="font-semibold text-purple-300">
          Lifetime = as long as Aletheia exists. If we ever shut down,
          you&apos;ll get 12 months notice + full data export.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property",
    legalText: (
      <>
        <p>
          <strong className="text-white">7.1 Platform Ownership.</strong> The
          Aletheia platform, including its source code, design, algorithms,
          AI models, documentation, trademarks, and all other intellectual
          property, is owned by Aletheia Intelligence and is protected by
          applicable intellectual property laws.
        </p>
        <p className="mt-4">
          <strong className="text-white">7.2 User Data Ownership.</strong> You
          retain full ownership of your investigation data, uploaded evidence,
          analyst notes, and any content you create within the Service. We
          claim no intellectual property rights over your investigation
          outputs.
        </p>
        <p className="mt-4">
          <strong className="text-white">7.3 License Grant.</strong> By using
          the Service, you grant us a limited, non-exclusive license to
          process your data solely for the purpose of delivering the Service
          to you. This license terminates when you delete your data or close
          your account.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We own the platform. You own your investigation data. Simple.
        </p>
        <p>
          We only process your data to run the service — no hidden license
          grabs.
        </p>
      </>
    ),
  },
  {
    id: "data-accuracy",
    title: "8. Data Accuracy Disclaimer",
    legalText: (
      <>
        <p className="p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
          <strong className="text-amber-400">Important:</strong> Intelligence
          gathered from public sources may be incomplete, outdated, or
          inaccurate. Aletheia does not guarantee the accuracy, completeness,
          or reliability of third-party data sources. Reports and intelligence
          outputs are provided &quot;as is&quot; and should be independently
          verified before being used as the basis for any decision.
        </p>
        <p className="mt-4">
          AI-generated analysis, entity correlations, and risk assessments are
          probabilistic in nature and may contain errors. Aletheia&apos;s AI
          features are designed to assist human analysts, not replace
          professional judgment. Users should not rely solely on automated
          intelligence outputs for legal, financial, or safety-critical
          decisions.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Public data can be wrong, outdated, or incomplete. AI analysis is
          probabilistic — it assists your judgment, it doesn&apos;t replace it.
        </p>
        <p>Always verify important findings independently.</p>
      </>
    ),
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    legalText: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
          ALETHEIA INTELLIGENCE, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS,
          OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS
          OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
          ARISING OUT OF OR IN CONNECTION WITH:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>Your use or inability to use the Service.</li>
          <li>
            Any intelligence, reports, or data obtained through the Service.
          </li>
          <li>
            Unauthorized access to or alteration of your transmissions or
            data.
          </li>
          <li>
            Actions taken based on intelligence generated by the Service.
          </li>
          <li>
            Any third-party content, products, or services accessed through
            the Service.
          </li>
        </ul>
        <p className="mt-4">
          OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR
          RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT
          YOU HAVE PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We&apos;re not liable for indirect damages or decisions made based on
          intelligence from the platform.
        </p>
        <p>
          Maximum liability is capped at what you&apos;ve paid us in the last
          12 months.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "10. Termination",
    legalText: (
      <>
        <p>
          <strong className="text-white">10.1 By You.</strong> You may
          terminate your account at any time by deleting your account through
          the dashboard settings or by contacting{" "}
          <a
            href="mailto:legal@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            legal@aletheia.io
          </a>
          . Upon termination, your data will be deleted in accordance with our
          Privacy Policy.
        </p>
        <p className="mt-4">
          <strong className="text-white">10.2 By Us.</strong> We reserve the
          right to suspend or terminate your account immediately, without
          prior notice, if we reasonably determine that you have violated
          these Terms, engaged in prohibited activities, or pose a risk to
          the security or integrity of the Service or other users.
        </p>
        <p className="mt-4">
          <strong className="text-white">10.3 Effect of Termination.</strong>{" "}
          Upon termination, your right to access the Service ceases
          immediately. Sections of these Terms that by their nature should
          survive termination (including but not limited to Intellectual
          Property, Limitation of Liability, and Governing Law) shall survive.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          You can delete your account anytime. We can terminate accounts that
          violate these terms.
        </p>
        <p>
          If terminated, your data is deleted per our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "11. Governing Law & Disputes",
    legalText: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the State of Delaware, United States, without regard to its
          conflict of law provisions.
        </p>
        <p className="mt-4">
          Any dispute arising out of or relating to these Terms or the Service
          shall first be attempted to be resolved through good-faith
          negotiation. If a dispute cannot be resolved through negotiation
          within 30 days, it shall be resolved through binding arbitration
          administered by the American Arbitration Association under its
          Commercial Arbitration Rules.
        </p>
        <p className="mt-4">
          Nothing in this section shall prevent either party from seeking
          injunctive or other equitable relief in a court of competent
          jurisdiction to prevent the actual or threatened infringement of
          intellectual property rights or confidentiality obligations.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Delaware law governs. Disputes go through negotiation first, then
          binding arbitration if needed.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "12. Contact",
    legalText: (
      <>
        <p>
          For any questions or concerns regarding these Terms of Service,
          please contact us:
        </p>
        <p className="mt-4 p-4 border border-slate-700/60 rounded-lg bg-slate-800/30">
          <strong className="text-white">Aletheia Intelligence</strong>
          <br />
          Legal Department
          <br />
          Email:{" "}
          <a
            href="mailto:legal@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            legal@aletheia.io
          </a>
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Questions about these terms? Email{" "}
          <span className="text-purple-300">legal@aletheia.io</span> — our
          legal team will respond promptly.
        </p>
      </>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="June 20, 2026"
      sections={sections}
    />
  );
}
