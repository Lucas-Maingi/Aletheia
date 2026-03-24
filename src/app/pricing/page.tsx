"use client";

import { motion } from "framer-motion";
import { 
  Shield, Zap, Check, ArrowRight, Hexagon, Database, 
  Fingerprint, MessageSquare, Terminal, Cpu, Globe, 
  Lock, Activity, Sparkles, Flame, Infinity as InfinityIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/landing/landing-header";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const features = [
  { 
    title: "Recursive Identity Expansion", 
    desc: "Automated multi-hop target mapping across 1000+ data nodes.",
    icon: InfinityIcon,
    color: "text-purple-400"
  },
  { 
    title: "Deep Web Breach Retrieval", 
    desc: "Live access to 10B+ leaked credentials and historical dumps.",
    icon: Database,
    color: "text-rose-400"
  },
  { 
    title: "Real-time GPS Provenance", 
    desc: "Extract precise location data from EXIF/metadata and image history.",
    icon: Globe,
    color: "text-blue-400"
  },
  { 
    title: "Dark Net Market Crawler", 
    desc: "Search active .onion markets for target aliases and trade history.",
    icon: Shield,
    color: "text-indigo-400"
  },
  { 
    title: "Biometric Cross-Reference", 
    desc: "Face-matching across social platforms and public criminal databases.",
    icon: Fingerprint,
    color: "text-emerald-400"
  },
  { 
    title: "Autonomous Agent Clusters", 
    desc: "Deploy up to 25 specialized AI 'Hunters' to run concurrent sweeps.",
    icon: Cpu,
    color: "text-amber-400"
  },
  { 
    title: "Cryptographic Evidence Vault", 
    desc: "SHA-256 hashed proof snapshots for legal and corporate submission.",
    icon: Lock,
    color: "text-slate-400"
  },
  { 
    title: "Priority LLM Execution", 
    desc: "Instant access to OpenAI o1, GPT-4o, and Gemini 1.5 Pro clusters.",
    icon: Sparkles,
    color: "text-accent"
  },
  { 
    title: "Social Graph Analysis", 
    desc: "Map familial, professional, and criminal proximity clusters automatically.",
    icon: Activity,
    color: "text-lime-400"
  },
  { 
    title: "Infra-Tracking Node", 
    desc: "Persistent monitoring of DNS, WHOIS, and IP-to-Target correlations.",
    icon: Terminal,
    color: "text-cyan-400"
  },
  { 
    title: "White-label Reporting", 
    desc: "Export professional, court-ready PDF dossiers with custom branding.",
    icon: Check,
    color: "text-success"
  },
  { 
    title: "API Access (Webhooks)", 
    desc: "Integrate Aletheia intelligence directly into your existing SOC.",
    icon: Flame,
    color: "text-orange-400"
  }
];

const plans = [
  {
    name: "Analyst",
    priceMonthly: "0",
    priceYearly: "0",
    desc: "The ultimate free starting point for independent researchers.",
    features: [
      "50 Concurrent Investigations",
      "Full Identity Social Mapping",
      "Email & Username Sweeps",
      "Public Record Retrieval",
      "1 Active Global Watchlist",
      "Basic Neural Summary (Gemini)",
      "Standard PDF Export"
    ],
    cta: "Deploy Terminal",
    href: "/dashboard",
    popular: false
  },
  {
    name: "Tactical Pro",
    priceMonthly: "49",
    priceYearly: "39",
    priceLtd: "399",
    desc: "The professional standard for investigators and SOC operators.",
    features: [
      "Unlimited Investigations",
      "Darkweb & Onion Scraping",
      "Reverse Image Search (AI)",
      "Web3 & Crypto Correlation",
      "30+ Premium API Data Sources",
      "10 Active Target Watchlists",
      "Deep Web Breach Retrieval",
      "Autonomous Agent Clusters"
    ],
    cta: "Start Hunting",
    gumroadMonthly: "https://gumroad.com/l/aletheia-pro-monthly",
    gumroadYearly: "https://gumroad.com/l/aletheia-pro-yearly",
    gumroadLtd: "https://gumroad.com/l/aletheia-pro-ltd",
    popular: true
  },
  {
    name: "Elite Team",
    priceMonthly: "149",
    priceYearly: "119",
    priceLtd: "999",
    desc: "Team-wide surveillance and high-volume batch processing.",
    features: [
      "Everything in Tactical Pro",
      "Real-time Darkweb Monitoring",
      "Batch Intelligence (1k Targets)",
      "Reverse Image Search (Unlimited)",
      "50 Active Watchlists",
      "5 Team Collaborator Seats",
      "API Webhook Integration",
      "Priority 24/7 Human Support"
    ],
    cta: "Upgrade Agency",
    gumroadMonthly: "https://gumroad.com/l/aletheia-team-monthly",
    gumroadYearly: "https://gumroad.com/l/aletheia-team-yearly",
    gumroadLtd: "https://gumroad.com/l/aletheia-team-ltd",
    popular: false
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="w-full bg-background min-h-screen">
      <LandingHeader />
      
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#020617] to-[#020617] -z-10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/10 text-accent text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Zap className="w-3.5 h-3.5" /> Licensed Intelligence
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-sans font-black text-white tracking-tight leading-[1.1] mb-6 uppercase italic">
            Pick your power.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            From basic scouting to autonomous global sweeps. Choose the tier that matches your intelligence requirements.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${!isYearly ? 'text-white' : 'text-text-tertiary'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 rounded-full bg-surface-elevated border border-border/10 p-1 transition-colors"
            >
              <motion.div 
                className="w-6 h-6 rounded-full bg-accent absolute top-1"
                animate={{ left: isYearly ? "calc(100% - 28px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isYearly ? 'text-white' : 'text-text-tertiary'}`}>Yearly</span>
              <Badge variant="accent" className="text-[9px] px-2 py-0.5 animate-pulse">Save 20%</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6 relative z-10 mt-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} isYearly={isYearly} index={i} />
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-32 bg-surface/10 border-t border-border/10 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase italic">
              Pro-Level Capabilities.
            </h2>
            <p className="text-lg text-text-secondary">
              Strategic advantages that move investigations from "Speculative" to "Conclusive" in under 30 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-8 rounded-3xl bg-surface/30 border border-border/5 hover:border-accent/30 hover:bg-surface/50 transition-all duration-500 relative overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-foreground/5 border border-border/10 ${f.color} group-hover:scale-110 group-hover:bg-foreground/10 transition-all duration-500`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3 uppercase tracking-tight italic">
                  {f.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">
        © 2026 Aletheia Intelligence Systems • [System_Authorized]
      </footer>
    </div>
  );
}

function PricingCard({ plan, isYearly, index }: { plan: any, isYearly: boolean, index: number }) {
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const isFree = price === "0";
  const mainCheckout = isFree ? plan.href : (isYearly ? plan.gumroadYearly : plan.gumroadMonthly);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-8 rounded-3xl border transition-all duration-500 flex flex-col h-full overflow-hidden group ${
        plan.popular 
          ? 'bg-surface/60 border-accent/40 shadow-[0_0_50px_rgba(168,85,247,0.15)] ring-1 ring-accent/20' 
          : 'bg-surface/20 border-border/10 hover:border-border/30 backdrop-blur-xl'
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
          Most Requested
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 italic">
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-5xl font-black text-text-primary tracking-tighter">${price}</span>
          {!isFree && <span className="text-text-tertiary font-bold uppercase tracking-widest text-[10px]">/mo</span>}
        </div>
        
        {/* Height preservation for the toggles */}
        <div className="h-4 mb-4">
           {!isFree && isYearly && (
              <span className="text-success text-[10px] font-bold uppercase tracking-widest">Billed annually</span>
           )}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed font-medium min-h-[40px]">
          {plan.desc}
        </p>
      </div>

      <div className="space-y-4 mb-10 flex-1">
        {plan.features.map((feature: string) => (
          <div key={feature} className="flex items-start gap-3">
            <div className={`mt-1 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'}`}>
              <Check className="h-2.5 w-2.5" />
            </div>
            <span className="text-sm text-text-secondary font-semibold">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <a href={mainCheckout} className="block w-full">
          <Button
            size="lg"
            className={`w-full font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] ${
              plan.popular 
                ? 'bg-accent hover:bg-accent-hover text-white shadow-accent/20' 
                : 'bg-surface-elevated hover:bg-white hover:text-background text-text-primary border border-border/10'
            }`}
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </a>

        {!isFree && plan.priceLtd && (
          <a href={plan.gumroadLtd} className="block w-full">
            <div className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50 transition-all cursor-pointer group">
              <span className="text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-amber-300 transition-colors">
                ♾ Lifetime Deal — ${plan.priceLtd} one-time
              </span>
            </div>
          </a>
        )}
      </div>

      {/* Decorative backgrounds */}
      {plan.popular && (
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />
      )}
    </motion.div>
  );
}
