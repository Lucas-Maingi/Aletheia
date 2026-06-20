import { LegalPageLayout, type LegalSection } from "@/components/landing/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ethical Intelligence Framework — Aletheia",
  description: "The ethical principles, operational boundaries, and responsible use guidelines governing the Aletheia OSINT platform.",
};

const sections: LegalSection[] = [
  {
    id: "mission-statement",
    title: "1. Mission Statement",
    legalText: (
      <>
        <p>
          Aletheia is built on the principle that information transparency is vital for security, truth, and accountability. Our mission is to make publicly available intelligence accessible, structured, and actionable for legitimate purposes.
        </p>
        <p className="mt-4">
          In an era of digital fragmentation, gathering relevant security information manually is slow and error-prone. Aletheia empowers threat analysts, journalists, security researchers, and corporate trust teams by automating the discovery and synthesis of open-source data. We believe that this technology should serve as a shield, protecting individuals and organizations by illuminating digital exposures before they can be exploited by malicious actors.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          Aletheia exists to help legitimate security analysts, researchers, and organizations find and understand public information.
        </p>
        <p>
          We believe transparency helps prevent security issues by letting you see your exposure first.
        </p>
      </>
    ),
  },
  {
    id: "operational-boundaries",
    title: "2. Operational Boundaries (What We Do & Don't Do)",
    legalText: (
      <>
        <p>
          To maintain ethical integrity and comply with international regulations, Aletheia operates strictly within defined boundaries. We distinguish between lawful, open-source intelligence gathering and unauthorized intrusion.
        </p>
        <p className="mt-4">
          <strong className="text-white">What We Do (In-Scope):</strong>
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            Query public APIs and open-source intelligence feeds with proper authorization and API keys.
          </li>
          <li>
            Search indexable public web pages and repositories using standard search syntax (e.g., Google Dorking).
          </li>
          <li>
            Cross-reference hashes of identifiers against public breach logs (e.g., HaveIBeenPwned) to identify exposure.
          </li>
          <li>
            Perform passive DNS lookup, WHOIS checks, and public IP geolocation.
          </li>
        </ul>
        <p className="mt-4">
          <strong className="text-white">What We DO NOT Do (Out-of-Scope & Prohibited):</strong>
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            We do not bypass paywalls, authentication layers, or digital rights management (DRM) systems.
          </li>
          <li>
            We do not hack, intercept communications, or access private databases or networks.
          </li>
          <li>
            We do not deploy malware, active scanning exploits, or intrusive tracking software.
          </li>
          <li>
            We do not compromise the privacy of individuals by scraping private communication channels or forums.
          </li>
        </ul>
      </>
    ),
    summary: (
      <>
        <p>
          <strong className="text-emerald-400">Allowed:</strong> Passive lookups, public APIs, searching indexed web pages, checking breach logs, DNS/WHOIS correlation.
        </p>
        <p className="mt-2">
          <strong className="text-red-400">Strictly Prohibited:</strong> No hacking, no bypassing logins/paywalls, no intercepting private chats, no malware, no active scanning.
        </p>
      </>
    ),
  },
  {
    id: "responsible-use",
    title: "3. Responsible Use Guidelines for Users",
    legalText: (
      <>
        <p>
          Aletheia is a powerful investigative tool. We require all users to adhere to strict ethical standards during their investigations. By using Aletheia, you agree to the following code of conduct:
        </p>
        <p className="mt-4">
          <strong className="text-white">3.1 Legitimate Investigative Purpose.</strong> You must only run investigations for legitimate security analysis, credential auditing, incident response, fraud prevention, journalism, or threat hunting.
        </p>
        <p className="mt-4">
          <strong className="text-white">3.2 Prohibited Activities.</strong> Under no circumstances may the Service be used for harassment, stalking, doxxing, unlawful surveillance, identity theft, or targeting individuals for personal retaliation or intimidation.
        </p>
        <p className="mt-4">
          <strong className="text-white">3.3 Compliance.</strong> You are solely responsible for ensuring your investigations comply with all applicable local, national, and international laws, including data privacy regulations in your jurisdiction (e.g., GDPR, CCPA).
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          You must only use Aletheia for real security, journalism, auditing, or research.
        </p>
        <p>
          You cannot use it to stalk, harass, dox, or conduct illegal surveillance on anyone.
        </p>
      </>
    ),
  },
  {
    id: "data-provenance",
    title: "4. Data Provenance & Integrity",
    legalText: (
      <>
        <p>
          A central pillar of OSINT is evidentiary value. Aletheia is designed to generate reliable, verifiable reports. We maintain a strict chain of evidence:
        </p>
        <p className="mt-4">
          <strong className="text-white">4.1 Cryptographic Hashing.</strong> Every piece of evidence ingested into Aletheia is hashed using SHA-256 upon capture. This ensures the integrity of the data remains unchanged and can be legally verified as a true copy of the source at that timestamp.
        </p>
        <p className="mt-4">
          <strong className="text-white">4.2 Source Citations.</strong> We provide clear, direct citations and source URLs for all evidence. We do not manufacture or synthesize facts; our AI models strictly summarize and correlate the documented sources.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We use SHA-256 hashing to verify that evidence hasn't been altered since it was found.
        </p>
        <p>
          We cite every single source so you can verify the information yourself.
        </p>
      </>
    ),
  },
  {
    id: "transparency-principles",
    title: "5. Transparency & Accountability",
    legalText: (
      <>
        <p>
          We believe in being open about our algorithms and methodologies. Aletheia does not operate as a 'black box.'
        </p>
        <p className="mt-4">
          All connectors used for searching are documented. When an entity is matched (for example, linking a username to a target email), we assign a confidence score and explain the logic behind the match. We encourage users to treat matches as probabilistic indicators that require manual verification, rather than absolute facts.
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We do not hide how our matches work.
        </p>
        <p>
          We display confidence scores and explain why we think two accounts are linked. Always verify matches manually.
        </p>
      </>
    ),
  },
  {
    id: "reporting-misuse",
    title: "6. Reporting Misuse & Feedback",
    legalText: (
      <>
        <p>
          We are committed to preventing the abuse of our platform. If you have reason to believe Aletheia is being used in violation of this framework or our Terms of Service, please contact us immediately.
        </p>
        <p className="mt-4">
          We investigate all complaints of platform abuse, stalking, or harassment. Accounts found violating these guidelines will be permanently suspended without refund.
        </p>
        <p className="mt-4 p-4 border border-slate-700/60 rounded-lg bg-slate-800/30">
          <strong className="text-white">Aletheia Ethics & Abuse Team</strong>
          <br />
          Email:{" "}
          <a
            href="mailto:ethics@aletheia.io"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            ethics@aletheia.io
          </a>
        </p>
      </>
    ),
    summary: (
      <>
        <p>
          We suspend accounts that violate our terms.
        </p>
        <p>
          To report misuse or ask ethics-related questions, email{" "}
          <span className="text-purple-300">ethics@aletheia.io</span>.
        </p>
      </>
    ),
  },
];

export default function EthicsFrameworkPage() {
  return (
    <LegalPageLayout
      title="Ethical Intelligence Framework"
      lastUpdated="June 20, 2026"
      sections={sections}
    />
  );
}
