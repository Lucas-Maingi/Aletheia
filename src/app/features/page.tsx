import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/footer";
import { 
  Shield, Zap, Search, Target, Database, Activity, 
  Terminal, ArrowRight, Lock, Eye, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { ContentBackButton } from "@/components/landing/content-back-button";


export const metadata: Metadata = {
  title: "Platform Features — Aletheia",
  description: "Explore the advanced features, intelligence connectors, and automated threat footprint sweeps of the Aletheia Agentic Truth Engine.",
};

const FEATURE_CATEGORIES = [
  {
    category: "OSINT Sweeps & Ingestion",
    description: "Multi-threaded target footprinting and passive data compilation.",
    icon: <Search className="w-5 h-5" />,
    features: [
      {
        title: "Email exposure scans",
        desc: "Trace email addresses across 100+ public indexes, newsletters, and registries to identify footprint anomalies."
      },
      {
        title: "Username correlation & pivots",
        desc: "Cross-reference target usernames across major platforms to map digital identities."
      },
      {
        title: "Infrastructure & DNS sweeps",
        desc: "Query domain WHOIS history, subdomains, passive DNS records, and registrar footprints."
      },
      {
        title: "Vehicle registry & LPR (Paid)",
        desc: "Scan license plates via text registry lookup or upload a vehicle image to run automatic Gemini-powered Visual LPR OCR extracting owner details."
      }
    ]
  },
  {
    category: "AI Synthesis & Dossiers",
    description: "LLM-powered timeline compilation and executive dossier reporting.",
    icon: <Terminal className="w-5 h-5" />,
    features: [
      {
        title: "Chronological timeline logs",
        desc: "Automatically compile target activity histories into unified, searchable timelines."
      },
      {
        title: "Executive dossier summaries",
        desc: "Generate concise threat intelligence summaries and confidence risk levels from raw evidence."
      },
      {
        title: "Dynamic entity extraction",
        desc: "Identify, categorize, and link target details (e.g. IPs, names, accounts) dynamically."
      }
    ]
  },
  {
    category: "Threat intelligence",
    description: "Data integrity sweeps and vulnerability mapping tools.",
    icon: <Shield className="w-5 h-5" />,
    features: [
      {
        title: "Breach database checks",
        desc: "Cross-check target assets against historic corporate and database breaches to find leaks."
      },
      {
        title: "Network & IP geolocations",
        desc: "Locate active target servers, hosting nodes, and network gateways."
      },
      {
        title: "Digital exposure audits",
        desc: "Analyze overall exposure ratings to identify high-risk threat vectors."
      }
    ]
  },
  {
    category: "Enterprise Scale",
    description: "Built for parallel operations, security compliance, and high throughput.",
    icon: <Zap className="w-5 h-5" />,
    features: [
      {
        title: "Bulk scans (Elite)",
        desc: "Upload target directories and run parallel multi-threaded scans."
      },
      {
        title: "Continuous watchlists (Pro)",
        desc: "Track critical subjects with real-time alerting and vulnerability monitors."
      },
      {
        title: "Local encrypted cache",
        desc: "Local, encrypted log auditing ensuring complete privacy and isolation of search footprints."
      }
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className="w-full bg-background min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-32 pb-24 w-full">
        <ContentBackButton />
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent tracking-widest uppercase">
            Capabilities Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight leading-none">
            Advanced <span className="text-accent">OSINT Orchestration</span>
          </h1>
          <p className="text-text-secondary text-base md:text-lg font-medium leading-relaxed">
            Aletheia consolidates over 12+ intelligence sources, automated threat sweeps, and generative AI synthesis into a single dashboard.
          </p>
        </div>

        {/* Feature Sections */}
        <div className="space-y-20">
          {FEATURE_CATEGORIES.map((cat, catIndex) => (
            <div key={catIndex} className="space-y-8">
              {/* Category Header */}
              <div className="flex items-center gap-3 border-b border-border/10 pb-4">
                <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg text-accent">
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">{cat.category}</h2>
                  <p className="text-xs text-text-tertiary font-medium">{cat.description}</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {cat.features.map((feat, featIndex) => (
                  <div 
                    key={featIndex} 
                    className="p-6 rounded-2xl bg-surface/50 border border-border/10 hover:border-accent/30 transition-all duration-300 group flex flex-col justify-between hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,240,255,0.02)]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-accent transition-colors">
                          {feat.title}
                        </h3>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Bar */}
        <div className="mt-24 p-8 border border-accent/20 rounded-3xl bg-surface/40 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(0,240,255,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold text-white uppercase">Deploy Footprint Sweeps Instantly</h3>
            <p className="text-xs text-text-secondary max-w-xl font-medium leading-relaxed">
              Unlock the Pro and Elite features of Aletheia under our Lifetime Access founding member tiers.
            </p>
          </div>
          <Link href="/pricing" className="relative z-10 shrink-0">
            <Button size="lg" className="group shadow-lg shadow-accent/20">
              Claim Lifetime Access
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer className="bg-surface/30 backdrop-blur-md border-t border-border/10 relative z-20" />
    </div>
  );
}
