import { LegalPageLayout, type LegalSection } from "@/components/landing/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Aletheia",
  description: "How Aletheia collects, uses, and protects your data. GDPR and CCPA compliant.",
};

const sections: LegalSection[] = [
  {
    id: "data-collection",
    title: "1. Data We Collect",
    legalText: (
      <>
        <p>
          When you create an account or interact with the Aletheia platform
          (&quot;Service&quot;), we collect the following categories of personal
          and operational data:
        </p>
        <p className="mt-4">
          <strong className="text-white">1.1 Account Information.</strong> We
          collect your email address, display name, and authentication
          credentials when you register. Authentication is managed via Supabase
          Auth, and passwords are hashed using bcrypt before storage. We never
          store plaintext passwords.
        </p>
        <p className="mt-4">
          <strong className="text-white">1.2 Investigation Data.</strong> When
          you conduct investigations, we store your queries (email addresses,
          usernames, domains, IP addresses, and other search parameters),
          generated intelligence reports, evidence artifacts, entity graphs,
          and analyst notes. This data is stored in your isolated tenant space
          and is accessible only to you.
        </p>
        <p className="mt-4">
          <strong className="text-white">1.3 Evidence &amp; Artifacts.</strong>{" "}
          Files, screenshots, and documents you upload as evidence are stored
          with SHA-256 cryptographic hashes to ensure provenance and integrity.
          Metadata including upload timestamps and source URLs are retained
          alongside the evidence.
        </p>
        <p className="mt-4">
          <strong className="text-white">1.4 Payment Information.</strong>{" "}
          Payment processing is handled entirely by Gumroad as our Merchant of
          Record. We receive and store only transaction identifiers,
          subscription status, and license keys. We do not store credit card
          numbers, CVVs, or banking details on our infrastructure.
        </p>
        <p className="mt-4">
          <strong className="text-white">1.5 Usage Analytics.</strong> We
          collect anonymized usage data via Vercel Analytics, including page
          views, feature usage patterns, and performance metrics. This data
          does not contain personally identifiable information and cannot be
          linked back to individual users.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We collect your email and login info, the investigations you run,
          evidence you upload, and basic analytics about how you use the
          platform.
        </p>
        <p>
          Payment details stay with Gumroad — we never see your card number.
          Analytics are anonymized.
        </p>
      </>
    ),
  },
  {
    id: "data-usage",
    title: "2. How We Use Your Data",
    legalText: (
      <>
        <p>
          We use the data we collect for the following purposes:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            <strong className="text-white">Service Delivery:</strong> To
            execute intelligence queries, generate reports, store
            investigation history, and provide the core functionality of the
            Aletheia platform.
          </li>
          <li>
            <strong className="text-white">Service Improvement:</strong> To
            improve AI-powered analysis, entity resolution accuracy, and
            intelligence correlation through aggregated, anonymized usage
            patterns. Individual investigation data is never used to train
            models.
          </li>
          <li>
            <strong className="text-white">Security &amp; Integrity:</strong>{" "}
            To detect abuse, prevent unauthorized access, and maintain the
            security of our infrastructure and your data.
          </li>
          <li>
            <strong className="text-white">Communication:</strong> To send
            you service-related notifications, security alerts, and (with
            your consent) product updates.
          </li>
        </ul>
        <p className="mt-4 p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
          <strong className="text-purple-400">We do not sell your data.</strong>{" "}
          Your investigation queries, intelligence reports, evidence, and
          personal information are never sold, rented, or traded to third-party
          data brokers, advertisers, marketing firms, or any other entity.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Your data is used to run the service, improve it (using anonymized
          patterns, not your actual investigations), and keep things secure.
        </p>
        <p className="font-semibold text-purple-300">
          We never sell your data. Period.
        </p>
      </>
    ),
  },
  {
    id: "osint-disclosure",
    title: "3. OSINT Data Sources",
    legalText: (
      <>
        <p>
          Aletheia is an Open Source Intelligence (OSINT) platform. It is
          important that you understand the nature and boundaries of the data
          we access:
        </p>
        <p className="mt-4 p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
          Aletheia queries publicly available data sources. We do not access
          private databases, bypass authentication mechanisms, or intercept
          communications. All intelligence is derived from open-source,
          publicly accessible information.
        </p>
        <p className="mt-4">
          <strong className="text-white">3.1 Public Sources.</strong> Our
          platform aggregates data from publicly available APIs, search
          engines, social media profiles (where publicly visible), domain
          registration records (WHOIS), DNS records, public breach
          notification databases, and other open-source data repositories.
        </p>
        <p className="mt-4">
          <strong className="text-white">3.2 No Unauthorized Access.</strong>{" "}
          Aletheia does not engage in computer intrusion, credential stuffing,
          session hijacking, network interception, or any form of unauthorized
          access to retrieve information. We operate exclusively within legal
          and ethical boundaries.
        </p>
        <p className="mt-4">
          <strong className="text-white">3.3 Third-Party Data Accuracy.</strong>{" "}
          Intelligence derived from public sources may be incomplete, outdated,
          or inaccurate. We present data as retrieved from source systems and
          do not independently verify all third-party data points.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Aletheia only queries publicly available information — search
          engines, public APIs, WHOIS records, etc.
        </p>
        <p>
          We never hack, bypass logins, or intercept communications. Everything
          is from open sources, and we&apos;re transparent about that.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    legalText: (
      <>
        <p>
          <strong className="text-white">4.1 Investigation Data.</strong> Your
          investigations, reports, and evidence are stored until you explicitly
          delete them. You may delete individual investigations or bulk-clear
          your investigation history at any time through the dashboard.
        </p>
        <p className="mt-4">
          <strong className="text-white">4.2 Account Data.</strong> Your
          account information is retained for the duration of your account.
          Upon account deletion, all personal data, investigation history,
          stored evidence, and associated metadata are permanently purged from
          our systems within 30 days.
        </p>
        <p className="mt-4">
          <strong className="text-white">4.3 Backups.</strong> Encrypted
          backups may retain deleted data for up to 90 days before automatic
          expiration. Backup data is encrypted at rest and is not accessible
          for operational queries.
        </p>
        <p className="mt-4">
          <strong className="text-white">4.4 Analytics Data.</strong>{" "}
          Anonymized analytics data is retained for up to 24 months for trend
          analysis and then automatically purged.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Your investigations stay until you delete them. Delete your account
          and everything is purged within 30 days (90 days for encrypted
          backups).
        </p>
        <p>You&apos;re in control of your data lifecycle.</p>
      </>
    ),
  },
  {
    id: "gdpr",
    title: "5. GDPR Compliance",
    legalText: (
      <>
        <p>
          If you are located in the European Economic Area (EEA), United
          Kingdom, or Switzerland, you are afforded the following rights under
          the General Data Protection Regulation (GDPR):
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            <strong className="text-white">Right of Access:</strong> You may
            request a copy of all personal data we hold about you.
          </li>
          <li>
            <strong className="text-white">Right to Rectification:</strong>{" "}
            You may request correction of inaccurate or incomplete personal
            data.
          </li>
          <li>
            <strong className="text-white">Right to Erasure:</strong> You may
            request deletion of your personal data, subject to legal retention
            obligations.
          </li>
          <li>
            <strong className="text-white">Right to Data Portability:</strong>{" "}
            You may request an export of your data in a structured,
            machine-readable format (JSON).
          </li>
          <li>
            <strong className="text-white">Right to Object:</strong> You may
            object to certain types of processing, including processing for
            direct marketing purposes.
          </li>
          <li>
            <strong className="text-white">Right to Restrict Processing:</strong>{" "}
            You may request that we limit the processing of your personal data
            in certain circumstances.
          </li>
        </ul>
        <p className="mt-4">
          To exercise any of these rights, contact us at{" "}
          <a
            href="mailto:privacy@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            privacy@aletheia.io
          </a>
          . We will respond within 30 days. A Data Processing Agreement (DPA)
          is available upon request for enterprise customers.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          If you&apos;re in the EU/EEA/UK, you have full GDPR rights: access,
          correct, delete, export, object, and restrict your data.
        </p>
        <p>
          Email{" "}
          <span className="text-purple-300">privacy@aletheia.io</span> and
          we&apos;ll respond within 30 days. DPA available for enterprise.
        </p>
      </>
    ),
  },
  {
    id: "ccpa",
    title: "6. CCPA Compliance",
    legalText: (
      <>
        <p>
          If you are a California resident, the California Consumer Privacy Act
          (CCPA) and the California Privacy Rights Act (CPRA) grant you the
          following rights:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            <strong className="text-white">Right to Know:</strong> You may
            request disclosure of the categories and specific pieces of
            personal information we have collected about you.
          </li>
          <li>
            <strong className="text-white">Right to Delete:</strong> You may
            request deletion of your personal information, subject to certain
            exceptions.
          </li>
          <li>
            <strong className="text-white">Right to Opt-Out:</strong> You have
            the right to opt out of the &quot;sale&quot; of personal
            information. As stated above, we do not sell personal information.
          </li>
          <li>
            <strong className="text-white">Right to Non-Discrimination:</strong>{" "}
            We will not discriminate against you for exercising your privacy
            rights.
          </li>
        </ul>
        <p className="mt-4">
          To exercise your CCPA rights, contact us at{" "}
          <a
            href="mailto:privacy@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            privacy@aletheia.io
          </a>
          . We will verify your identity and respond within 45 days as
          required by law.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          California residents: you can know what we collect, request deletion,
          and opt out of data sales (though we don&apos;t sell data anyway).
        </p>
        <p>No discrimination for exercising your rights.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "7. Cookies & Tracking",
    legalText: (
      <>
        <p>Aletheia uses a minimal set of cookies and tracking technologies:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            <strong className="text-white">Session Cookies:</strong> Essential
            cookies that maintain your authenticated session. These are
            strictly necessary for the platform to function and cannot be
            disabled.
          </li>
          <li>
            <strong className="text-white">Authentication Tokens:</strong>{" "}
            Secure, httpOnly tokens managed by Supabase Auth to maintain your
            login state across sessions.
          </li>
          <li>
            <strong className="text-white">Analytics (Vercel Analytics):</strong>{" "}
            Privacy-focused, anonymized web analytics that do not use cookies
            for tracking. Vercel Analytics collects aggregate performance and
            usage data without personally identifiable information.
          </li>
        </ul>
        <p className="mt-4">
          We do not use advertising cookies, social media tracking pixels, or
          any third-party behavioral tracking technologies.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We only use essential cookies (login sessions) and privacy-focused
          Vercel Analytics. No ad trackers, no social media pixels, no
          behavioral tracking.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "8. Third-Party Services",
    legalText: (
      <>
        <p>
          Aletheia relies on the following third-party services to deliver the
          platform. Each operates under its own privacy policy:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-3">
          <li>
            <strong className="text-white">Supabase</strong> — Authentication,
            database, and real-time infrastructure. Data is stored in SOC 2
            Type II compliant data centers. Row Level Security (RLS) ensures
            strict tenant isolation.
          </li>
          <li>
            <strong className="text-white">Google Gemini (AI)</strong> — Powers
            AI-driven intelligence analysis, entity extraction, and report
            generation. Investigation queries are processed via the Gemini API
            but are not used to train Google&apos;s models under our API terms
            of service.
          </li>
          <li>
            <strong className="text-white">Gumroad</strong> — Payment
            processing and license management as our Merchant of Record.
            Gumroad handles all payment card data in compliance with PCI DSS.
          </li>
          <li>
            <strong className="text-white">Vercel</strong> — Application
            hosting, edge functions, and analytics. Deployed on Vercel&apos;s
            edge network with automatic TLS encryption.
          </li>
        </ul>
      </>
    ),
    summary: (
      <>
        <p>
          Our stack: Supabase (database), Google Gemini (AI), Gumroad
          (payments), and Vercel (hosting). Each has enterprise-grade security.
        </p>
        <p>
          Your investigation queries sent to Gemini are not used to train
          Google&apos;s AI models.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "9. Data Security",
    legalText: (
      <>
        <p>
          We implement industry-standard security measures to protect your
          data:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>
            <strong className="text-white">Encryption at Rest:</strong> All
            data stored in our databases is encrypted at rest using AES-256
            encryption.
          </li>
          <li>
            <strong className="text-white">Encryption in Transit:</strong> All
            communications between your browser and our servers are encrypted
            using TLS 1.3.
          </li>
          <li>
            <strong className="text-white">Evidence Provenance:</strong>{" "}
            SHA-256 cryptographic hashing is applied to all stored evidence
            and artifacts, ensuring chain-of-custody integrity and tamper
            detection.
          </li>
          <li>
            <strong className="text-white">Data Isolation:</strong>{" "}
            Supabase Row Level Security (RLS) policies enforce strict tenant
            isolation, ensuring users can only access their own investigation
            data.
          </li>
          <li>
            <strong className="text-white">Access Controls:</strong>{" "}
            Administrative access to production systems is restricted,
            audited, and requires multi-factor authentication.
          </li>
        </ul>
        <p className="mt-4">
          While no system can guarantee absolute security, we are committed to
          promptly addressing any security vulnerabilities. To report a
          security issue, contact{" "}
          <a
            href="mailto:privacy@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            privacy@aletheia.io
          </a>
          .
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          AES-256 encryption at rest, TLS 1.3 in transit, SHA-256 evidence
          hashing, and Row Level Security for data isolation.
        </p>
        <p>Your investigation data is locked down tight.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "10. Contact & Changes",
    legalText: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, technology, legal requirements, or other factors.
          When we make material changes, we will notify you via email or a
          prominent notice within the platform at least 30 days before the
          changes take effect.
        </p>
        <p className="mt-4">
          For any questions, concerns, or requests regarding this Privacy Policy
          or your personal data, please contact us:
        </p>
        <p className="mt-4 p-4 border border-slate-700/60 rounded-lg bg-slate-800/30">
          <strong className="text-white">Aletheia Intelligence</strong>
          <br />
          Privacy Inquiries
          <br />
          Email:{" "}
          <a
            href="mailto:privacy@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            privacy@aletheia.io
          </a>
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We&apos;ll give you 30 days notice before any material changes to
          this policy.
        </p>
        <p>
          Questions? Email{" "}
          <span className="text-purple-300">privacy@aletheia.io</span> — we
          take your privacy seriously.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="June 20, 2026"
      sections={sections}
    />
  );
}
