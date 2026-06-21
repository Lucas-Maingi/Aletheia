import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/footer";
import { Shield, Target, Users, Code, Award, Zap } from "lucide-react";
import type { Metadata } from "next";
import { ContentBackButton } from "@/components/landing/content-back-button";


export const metadata: Metadata = {
  title: "About Us — Aletheia",
  description: "Learn about the mission, team, and technology behind Aletheia, the autonomous open-source intelligence engine.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-background min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-32 pb-24">
        <ContentBackButton />
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-accent tracking-widest uppercase">
            Our Mission
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight leading-none">
            Illuminating the <span className="text-accent">Digital Footprint</span>
          </h1>
          <p className="text-text-secondary text-base md:text-lg font-medium leading-relaxed">
            Aletheia was founded on the belief that transparency is the ultimate shield. We build autonomous tools to help investigators, analysts, and organizations find truth in public data.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 rounded-2xl bg-surface border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-accent">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Truth first</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              We aggregate raw, publicly accessible evidence without bias or manipulation. Every intelligence point is verifiable.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-accent">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Advanced Automation</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Manual recon is slow and fragmented. Aletheia automates multi-threaded queries to compile dossiers in seconds.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-accent">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Responsible OSINT</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              We establish clear ethical guardrails. Aletheia does not engage in hacking or bypass privacy restrictions.
            </p>
          </div>
        </div>

        {/* Tech Stack section */}
        <div className="p-8 md:p-12 rounded-3xl bg-surface/50 border border-white/5 backdrop-blur-md relative overflow-hidden mb-24">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/10 to-transparent blur-3xl" />
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic">Built for Scale</h2>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Our architecture combines serverless Next.js performance, Prisma schema relational modeling, and advanced AI synthesizers. With 17+ custom intelligence connectors working in parallel, Aletheia orchestrates data retrieval across breaches, social profiles, domain registries, and block explorers without single points of failure.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-400">
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded">17+ OSINT Connectors</span>
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded">Next.js 16 (Turbopack)</span>
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded">Supabase Auth</span>
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded">Prisma Postgres Client</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
