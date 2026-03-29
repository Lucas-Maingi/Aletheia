import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-background min-h-screen">
      <LandingHeader />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 prose prose-invert prose-slate">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-8 uppercase italic">
          Privacy Policy
        </h1>
        <p className="text-sm text-text-tertiary">Last Updated: March 2026</p>

        <section className="mt-12 space-y-8 text-text-secondary leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Data We Collect</h2>
            <p>
              When you interact with Aletheia Intelligence, whether via our web application or API, we collect specific data points to deliver our open-source intelligence services:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Account Information:</strong> We store the email addresses, passwords, and IDs used to authenticate and safeguard your account via Supabase.</li>
              <li><strong>Billing Information:</strong> Payments and subscriptions are collected securely by authorized Merchants of Record (e.g. Gumroad). We do not directly store complete credit card information on our servers; we only store metadata identifying subscription states.</li>
              <li><strong>Search Telemetry:</strong> To provide you with your history and dashboard features, we log the parameters (emails, usernames, IP addresses, domains) you submit for investigation alongside the resulting reports.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. How We Use and Protect Your Data</h2>
            <p>
              Your search targets and investigation data belong strictly to you. We employ your queries solely to aggregate signals across integrated public sources and specialized APIs to orchestrate your report. We do not sell your investigation queries, targets, or analytical outputs to third-party data brokers, marketing firms, or advertising networks.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Data Retention and Deletion</h2>
            <p>
              Aletheia stores your investigations in your dashboard for your convenience. You may choose to permanently delete an investigation from your account at any time. Upon deletion, the target entity data and associated generated reports are purged from our database. If you wish to completely close your account, contact our support pipeline and all linked records will be scrubbed.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Third-Party API Partners</h2>
            <p>
              Aletheia acts as an aggregator for specialized security vendors, including FaceCheck.id, HaveIBeenPwned, and various public registration endpoints. When you run an investigation, target identifiers (like a hash of an email, or an image file) are transmitted via encrypted pipelines to these partners to assess risk. Our partners operate under their own privacy protocols, typically bound by transient lookup agreements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Security Infrastructure</h2>
            <p>
              Aletheia Intelligence uses modern cloud providers (Vercel) and enterprise-grade posture (Supabase RLS) to protect our environment from unauthorized intrusion. We enforce strict transport layer encryption (TLS 1.3) across our external and internal networking vectors.
            </p>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
