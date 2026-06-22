"use client";

import { motion } from "framer-motion";
import {
  Shield, Zap, Check, ArrowRight, Lock, Sparkles,
  Search, Database, Fingerprint, Globe, Eye, Terminal,
  Activity, Flame, Crown, Star, Clock, Users, X,
  ChevronDown, ShieldCheck, Infinity as InfinityIcon,
  FileText, Hash, Layers, BellRing, Coins, Webhook,
  Cpu, Image as ImageIcon, Network, UserSearch, Award
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/footer";
import { LAUNCH_CONFIG } from "@/lib/launch-config";
import { useState } from "react";
import { ContentBackButton } from "@/components/landing/content-back-button";


// ─── LTD Tier Feature Definitions ───────────────────────────────────
const LTD_FEATURES: Record<string, { target: string; features: string[]; icon: any; gradient: string; glowColor: string }> = {
  analyst_pro: {
    target: "For individual investigators",
    icon: Search,
    gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
    glowColor: "rgba(99,102,241,0.15)",
    features: [
      "Unlimited investigations",
      "17+ OSINT connectors",
      "AI intelligence synthesis",
      "Breach database access",
      "Username enumeration (25+ platforms)",
      "Domain / DNS / WHOIS intelligence",
      "IP geolocation & mapping",
      "Google dorking engine",
      "Vehicle registry lookup",
      "Visual LPR plate scanner",
      "Evidence management",
      "SHA-256 provenance hashing",
      "PDF export & reporting",
      "Email support",
    ],
  },
  command_center: {
    target: "For security teams",
    icon: Shield,
    gradient: "from-purple-500/20 via-accent/10 to-transparent",
    glowColor: "rgba(168,85,247,0.2)",
    features: [
      "Everything in Analyst Pro",
      "Facial recognition analysis",
      "Reverse image search",
      "Dark web intelligence",
      "Crypto wallet tracing",
      "Watchlists & monitoring",
      "Real-time alerts",
      "Advanced identity graph",
      "Priority AI models",
      "Team collaboration (3 seats)",
      "API access",
    ],
  },
  agency_arsenal: {
    target: "For agencies & enterprises",
    icon: Crown,
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    glowColor: "rgba(245,158,11,0.15)",
    features: [
      "Everything in Command Center",
      "Unlimited team seats",
      "Batch investigation processing",
      "White-label reports",
      "Custom data source connectors",
      "Webhook integrations",
      "Dedicated support manager",
      "Priority feature requests",
      "Custom deployment options",
    ],
  },
};

// ─── Full Feature Comparison Data ───────────────────────────────────
type FeatureValue = boolean | string;

interface ComparisonFeature {
  name: string;
  free: FeatureValue;
  analyst_pro: FeatureValue;
  command_center: FeatureValue;
  agency_arsenal: FeatureValue;
}

interface ComparisonCategory {
  category: string;
  features: ComparisonFeature[];
}

const COMPARISON_DATA: ComparisonCategory[] = [
  {
    category: "Core Intelligence",
    features: [
      { name: "Investigations per month", free: "3", analyst_pro: "Unlimited", command_center: "Unlimited", agency_arsenal: "Unlimited" },
      { name: "OSINT connectors", free: "5", analyst_pro: "17+", command_center: "17+", agency_arsenal: "17+ custom" },
      { name: "AI intelligence synthesis", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Evidence management", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "SHA-256 provenance hashing", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
    ],
  },
  {
    category: "Data Sources",
    features: [
      { name: "Breach database access", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Username enumeration", free: "5 platforms", analyst_pro: "25+ platforms", command_center: "25+ platforms", agency_arsenal: "25+ platforms" },
      { name: "Domain / DNS / WHOIS", free: "Basic", analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "IP geolocation", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Google dorking engine", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Vehicle registry lookup", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Visual LPR plate scanner", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Dark web intelligence", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Crypto wallet tracing", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
    ],
  },
  {
    category: "Advanced Capabilities",
    features: [
      { name: "Facial recognition analysis", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Reverse image search", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Advanced identity graph", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Watchlists & monitoring", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Real-time alerts", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Batch investigation processing", free: false, analyst_pro: false, command_center: false, agency_arsenal: true },
    ],
  },
  {
    category: "Team & Integration",
    features: [
      { name: "Team seats", free: "1", analyst_pro: "1", command_center: "3", agency_arsenal: "Unlimited" },
      { name: "API access", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Webhook integrations", free: false, analyst_pro: false, command_center: false, agency_arsenal: true },
      { name: "Custom data source connectors", free: false, analyst_pro: false, command_center: false, agency_arsenal: true },
      { name: "White-label reports", free: false, analyst_pro: false, command_center: false, agency_arsenal: true },
    ],
  },
  {
    category: "Support & Extras",
    features: [
      { name: "PDF export", free: "Basic", analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Priority AI models", free: false, analyst_pro: false, command_center: true, agency_arsenal: true },
      { name: "Email support", free: false, analyst_pro: true, command_center: true, agency_arsenal: true },
      { name: "Dedicated support manager", free: false, analyst_pro: false, command_center: false, agency_arsenal: true },
      { name: "Priority feature requests", free: false, analyst_pro: false, command_center: false, agency_arsenal: true },
      { name: "Custom deployment options", free: false, analyst_pro: false, command_center: false, agency_arsenal: true },
    ],
  },
];

// ─── FAQ Data ───────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: "What does \"lifetime access\" mean?",
    a: "Lifetime access means you pay once and receive access to Aletheia for as long as the platform exists. This includes all future updates, new features, and infrastructure improvements — no recurring fees, ever. Your founding member status is permanently locked in.",
  },
  {
    q: "What if you shut down the platform?",
    a: "We're building Aletheia for the long term. However, if we ever discontinue the service, all founding members will receive 12 months advance notice, a full data export, and the option to self-host the platform with a perpetual license key.",
  },
  {
    q: "Can I upgrade my tier later?",
    a: "Absolutely. You can upgrade from Analyst Pro to Command Center or Agency Arsenal at any time. You'll only pay the price difference between tiers. Founding member pricing is locked — even if we raise prices later, your upgrade cost stays relative to your original purchase.",
  },
  {
    q: "Is my data private and secure?",
    a: "Privacy is non-negotiable. All investigation data is encrypted at rest (AES-256) and in transit (TLS 1.3). We operate on a zero-knowledge architecture — we cannot see your investigation targets or results. All data is stored in SOC 2 compliant infrastructure. You own your data, always.",
  },
  {
    q: "What happens when monthly billing launches?",
    a: "When we switch to monthly billing (Q4 2026), lifetime deal holders keep everything. You will never be moved to a subscription. In fact, founding members will likely receive capabilities that exceed even our highest monthly tier as a thank-you for early support.",
  },
  {
    q: "Can I get a refund?",
    a: `Yes. We offer a full ${LAUNCH_CONFIG.MONEY_BACK_DAYS}-day money-back guarantee, no questions asked. If Aletheia doesn't meet your expectations, contact us within 30 days and we'll issue a complete refund. We're confident you'll stay.`,
  },
];

// ─── Helper: Calculate Annual Savings ───────────────────────────────
function calcSavings(ltdPrice: number, monthlyPrice: number): number {
  return monthlyPrice * 12 - ltdPrice;
}

// ─── Page Component ─────────────────────────────────────────────────
export default function PricingPage() {
  const ltdTiers = LAUNCH_CONFIG.LTD_TIERS;
  const monthlyTiers = LAUNCH_CONFIG.MONTHLY_TIERS;

  return (
    <div className="w-full bg-background min-h-screen">
      <LandingHeader />

      {/* ─── Hero ─────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background pointer-events-none -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 blur-[180px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-start">
            <ContentBackButton />
          </div>
          <div className="text-center">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-accent/30 text-accent text-xs font-black uppercase tracking-widest mb-8 shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            Lifetime Access — Limited Founding Member Slots
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-text-primary tracking-tight leading-[1.05] mb-6 uppercase italic"
          >
            Pay Once.{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-8">
              Own It Forever.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-6 leading-relaxed font-medium"
          >
            Secure lifetime access at founding-member pricing before we switch to monthly billing.
            Lock in your tier — slots are limited and non-renewable.
          </motion.p>

          {/* Trust signals row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              {LAUNCH_CONFIG.MONEY_BACK_DAYS}-Day Money-Back Guarantee
            </div>
            <div className="flex items-center gap-2">
              <InfinityIcon className="w-4 h-4 text-accent" />
              Lifetime Updates Included
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Founding Member Badge
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LTD Pricing Cards ────────────────────── */}
      <section className="pb-28 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {(Object.keys(ltdTiers) as Array<keyof typeof ltdTiers>).map(
            (key, i) => {
              const tier = ltdTiers[key];
              const featureData = LTD_FEATURES[key];
              const savings = calcSavings(tier.price, tier.originalMonthly);
              const isPopular = tier.badge === "Most Popular";

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className={`relative p-8 rounded-3xl border transition-all duration-500 flex flex-col h-full overflow-hidden group ${
                    isPopular
                      ? "bg-surface/60 border-accent/40 shadow-[0_0_60px_rgba(168,85,247,0.15)] ring-1 ring-accent/20 scale-[1.02] lg:scale-105"
                      : "bg-surface/20 border-border/10 hover:border-border/30 backdrop-blur-xl"
                  }`}
                >
                  {/* Decorative gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${featureData.gradient} pointer-events-none opacity-50`}
                  />

                  {/* Badge */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <Badge
                        variant={isPopular ? "accent" : "outline"}
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isPopular
                            ? "bg-accent/20 text-accent border-accent/30"
                            : ""
                        }`}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {tier.badge}
                      </Badge>
                      {isPopular && (
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_var(--accent)]" />
                      )}
                    </div>

                    {/* Name & Target */}
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPopular
                            ? "bg-accent/20 text-accent"
                            : "bg-surface-elevated text-text-secondary"
                        } border border-border/10`}
                      >
                        <featureData.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">
                          {tier.name}
                        </h3>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                          {featureData.target}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-6 mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-text-primary tracking-tighter">
                          ${tier.price}
                        </span>
                        <span className="text-text-tertiary font-bold text-xs uppercase tracking-widest">
                          one-time
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-text-tertiary line-through text-sm font-semibold">
                          ${tier.originalMonthly}/mo
                        </span>
                        <span className="text-[10px] font-black text-accent uppercase tracking-wider">
                          → Save ${savings} in Year 1
                        </span>
                      </div>
                    </div>

                    {/* Savings callout */}
                    <div className="mt-3 mb-6 p-3 rounded-xl bg-accent/5 border border-accent/10">
                      <p className="text-[11px] font-bold text-accent">
                        ${tier.price} vs ${tier.originalMonthly}/mo ={" "}
                        <span className="text-text-primary">
                          You save ${savings} in year 1 alone
                        </span>
                      </p>
                    </div>

                    {/* Slot urgency */}
                    <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-orange-400">
                        Limited to {tier.slots} founding slots
                      </span>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8 flex-1">
                      {featureData.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                              isPopular
                                ? "bg-accent/20 text-accent"
                                : "bg-success/20 text-success"
                            }`}
                          >
                            <Check className="h-2.5 w-2.5" />
                          </div>
                          <span className="text-sm text-text-secondary font-semibold">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto relative z-20 space-y-3">
                    <a href={`/checkout?plan=${key}`} className="block w-full">
                      <Button
                        size="lg"
                        className={`w-full font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] ${
                          isPopular
                            ? "bg-accent hover:bg-accent-hover text-white shadow-accent/20"
                            : "bg-surface-elevated hover:bg-white hover:text-background text-text-primary border border-border/10"
                        }`}
                      >
                        Secure {tier.name} — ${tier.price}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                    <p className="text-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                      {LAUNCH_CONFIG.MONEY_BACK_DAYS}-Day Money-Back Guarantee
                    </p>
                  </div>

                  {/* Glow */}
                  {isPopular && (
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
                  )}
                </motion.div>
              );
            }
          )}
        </div>
      </section>

      {/* ─── Future Monthly Pricing (Locked) ──────── */}
      <section className="pb-28 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border/20 text-text-tertiary text-xs font-black uppercase tracking-widest mb-4">
              <Lock className="w-3.5 h-3.5" />
              Coming Q4 2026
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-text-tertiary tracking-tight uppercase italic">
              Future Monthly Pricing
            </h2>
            <p className="text-text-tertiary/70 text-sm font-medium mt-3 max-w-lg mx-auto">
              These subscription tiers launch later this year. Lock in lifetime access above and never pay monthly.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 opacity-50 grayscale pointer-events-none select-none">
            {(
              Object.keys(monthlyTiers) as Array<keyof typeof monthlyTiers>
            ).map((key, i) => {
              const tier = monthlyTiers[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative p-6 rounded-2xl bg-surface/10 border border-border/10 backdrop-blur-md"
                >
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-text-tertiary/50" />
                  </div>
                  <h4 className="text-sm font-black text-text-tertiary uppercase tracking-tight italic mb-3">
                    {tier.name}
                  </h4>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black text-text-tertiary tracking-tighter">
                      ${tier.price}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-text-tertiary/60 text-xs font-bold">
                        /mo
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-text-tertiary/50 uppercase tracking-widest">
                    {tier.investigations === -1
                      ? "Unlimited investigations"
                      : `${tier.investigations} investigations/mo`}
                  </p>
                  <div className="mt-4 p-2 rounded-lg bg-background/40 border border-border/10 text-center">
                    <span className="text-[10px] font-black text-text-tertiary/40 uppercase tracking-widest">
                      🔒 Locked — Q4 2026
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Feature Comparison Table ─────────────── */}
      <section className="py-28 px-6 bg-surface/5 border-t border-border/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 border-accent/20 bg-accent/5 text-accent uppercase font-black tracking-widest text-[10px]"
            >
              Full Breakdown
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight uppercase italic">
              Compare Every Feature.
            </h2>
          </motion.div>

          <div className="overflow-x-auto rounded-2xl border border-border/10 bg-surface/20 backdrop-blur-xl">
            <table className="w-full min-w-[700px]">
              {/* Header */}
              <thead>
                <tr className="border-b border-border/10">
                  <th className="text-left p-5 text-xs font-black text-text-tertiary uppercase tracking-widest w-[30%]">
                    Feature
                  </th>
                  <th className="p-5 text-center text-xs font-black text-text-tertiary uppercase tracking-widest">
                    Free
                  </th>
                  <th className="p-5 text-center text-xs font-black text-text-tertiary uppercase tracking-widest">
                    Analyst Pro
                  </th>
                  <th className="p-5 text-center relative">
                    <div className="absolute inset-0 bg-accent/[0.03]" />
                    <span className="relative text-xs font-black text-accent uppercase tracking-widest">
                      Command Center
                    </span>
                  </th>
                  <th className="p-5 text-center text-xs font-black text-text-tertiary uppercase tracking-widest">
                    Agency Arsenal
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((section) => (
                  <>
                    {/* Category header */}
                    <tr
                      key={`cat-${section.category}`}
                      className="bg-surface/30"
                    >
                      <td
                        colSpan={5}
                        className="px-5 py-3 text-[10px] font-black text-accent uppercase tracking-[0.25em]"
                      >
                        {section.category}
                      </td>
                    </tr>
                    {section.features.map((feat) => (
                      <tr
                        key={feat.name}
                        className="border-b border-border/5 hover:bg-surface/20 transition-colors"
                      >
                        <td className="p-4 pl-5 text-sm font-semibold text-text-secondary">
                          {feat.name}
                        </td>
                        {(
                          [
                            "free",
                            "analyst_pro",
                            "command_center",
                            "agency_arsenal",
                          ] as const
                        ).map((col) => {
                          const val = feat[col];
                          const isCommand = col === "command_center";
                          return (
                            <td
                              key={col}
                              className={`p-4 text-center ${
                                isCommand ? "bg-accent/[0.03]" : ""
                              }`}
                            >
                              {val === true ? (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/20">
                                  <Check className="w-3.5 h-3.5 text-success" />
                                </div>
                              ) : val === false ? (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-elevated">
                                  <X className="w-3.5 h-3.5 text-text-tertiary/40" />
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-text-primary">
                                  {val}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
                {/* Price row */}
                <tr className="border-t border-border/20 bg-surface/30">
                  <td className="p-5 text-sm font-black text-text-primary uppercase tracking-tight italic">
                    Price
                  </td>
                  <td className="p-5 text-center">
                    <div className="text-2xl font-black text-text-primary">$0</div>
                    <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-1">Forever</div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="text-2xl font-black text-text-primary">${ltdTiers.analyst_pro.price}</div>
                    <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-1">One-Time</div>
                  </td>
                  <td className="p-5 text-center bg-accent/[0.03]">
                    <div className="text-2xl font-black text-accent">${ltdTiers.command_center.price}</div>
                    <div className="text-[10px] font-bold text-accent/70 uppercase tracking-widest mt-1">One-Time</div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="text-2xl font-black text-text-primary">${ltdTiers.agency_arsenal.price}</div>
                    <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-1">One-Time</div>
                  </td>
                </tr>
                {/* CTA row */}
                <tr>
                  <td className="p-5"></td>
                  <td className="p-5 text-center">
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                        Start Free
                      </Button>
                    </Link>
                  </td>
                  <td className="p-5 text-center">
                    <a href="/checkout?plan=analyst_pro">
                      <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                        Get Pro
                      </Button>
                    </a>
                  </td>
                  <td className="p-5 text-center bg-accent/[0.03]">
                    <a href="/checkout?plan=command_center">
                      <Button variant="primary" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                        Get Command
                      </Button>
                    </a>
                  </td>
                  <td className="p-5 text-center">
                    <a href="/checkout?plan=agency_arsenal">
                      <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                        Get Arsenal
                      </Button>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Trust & Guarantee Section ────────────── */}
      <section className="py-20 px-6 border-t border-border/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: `${LAUNCH_CONFIG.MONEY_BACK_DAYS}-Day Money-Back Guarantee`,
                desc: "Not satisfied? Full refund within 30 days, no questions asked. Your purchase is completely risk-free.",
                color: "text-emerald-400",
                bg: "bg-emerald-400/10",
                border: "border-emerald-400/20",
              },
              {
                icon: InfinityIcon,
                title: "Lifetime Updates Included",
                desc: "Every new feature, connector, and AI model upgrade — included forever. No upsells, no hidden costs.",
                color: "text-accent",
                bg: "bg-accent/10",
                border: "border-accent/20",
              },
              {
                icon: Award,
                title: "Founding Member Badge",
                desc: "Exclusive status in the Aletheia community. Priority support, early access to beta features, and direct input on the roadmap.",
                color: "text-amber-400",
                bg: "bg-amber-400/10",
                border: "border-amber-400/20",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-2xl bg-surface/20 border ${item.border} backdrop-blur-xl text-center`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ${item.bg} ${item.color} border border-border/10`}
                >
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight italic mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary font-medium leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────── */}
      <section className="py-28 px-6 bg-surface/5 border-t border-border/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 border-accent/20 bg-accent/5 text-accent uppercase font-black tracking-widest text-[10px]"
            >
              Common Questions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight uppercase italic">
              Straight Answers.
            </h2>
          </motion.div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── LTD Capital Allocation Section ────────────────────── */}
      <section className="py-28 px-6 border-t border-border/10 relative overflow-hidden bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/5 blur-[160px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left text block: Strategic Positioning */}
            <div className="lg:col-span-5 space-y-6">
              <Badge
                variant="outline"
                className="px-4 py-1.5 border-accent/20 bg-accent/5 text-accent uppercase font-black tracking-widest text-[10px]"
              >
                Capital Strategy
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight leading-none uppercase italic">
                Why the LTD? <br />
                <span className="text-accent">Our Roadmap.</span>
              </h2>
              
              <div className="space-y-4 text-sm text-text-secondary leading-relaxed font-semibold">
                <p>
                  Aletheia is a self-sustaining, privately funded platform. We are not raising capital for survival or daily operations. Every core feature shown in our interactive demo is fully functional, online, and backed by robust infrastructure today.
                </p>
                <p>
                  Instead, we are launching this limited Founding Member Initiative to establish an upfront capital reserve. High-fidelity intelligence requires access to proprietary registers, facial recognition indexes, and commercial API queries. These inputs cannot be scraped or sourced for free.
                </p>
                <p>
                  By purchasing a Lifetime Deal today, you are directly funding the bulk licenses and API credits required to integrate these premium pipelines. This allows us to scale Aletheia's scanning depth to unmatched levels while keeping our operational query costs low for you forever.
                </p>
              </div>
            </div>

            {/* Right block: Ingestion & Operations allocations */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Network,
                  title: "Premium Data Integrations",
                  desc: "Funding bulk upfront API access to commercial facial recognition databases, reverse-image scanners (PimEyes/TinEye custom nodes), cell carrier registers, and dark web leak indexes.",
                  gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
                  border: "border-blue-500/20",
                  iconColor: "text-blue-400"
                },
                {
                  icon: Database,
                  title: "Historical Registries",
                  desc: "Securing corporate data feeds for deep historical WHOIS registers, reverse-DNS histories, and blockchain transaction risk telemetry (Chainalysis/Elliptic nodes).",
                  gradient: "from-purple-500/10 via-accent/5 to-transparent",
                  border: "border-purple-500/20",
                  iconColor: "text-purple-400"
                },
                {
                  icon: Cpu,
                  title: "Edge Engine Infrastructure",
                  desc: "Scaling globally distributed parallel scanning clusters. Enhancing HSM (Hardware Security Module) client-side zero-knowledge encryption key storage nodes.",
                  gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
                  border: "border-emerald-500/20",
                  iconColor: "text-emerald-400"
                },
                {
                  icon: Users,
                  title: "Professional Team Growth",
                  desc: "Expanding our active core team: dedicated threat-intelligence developers to update connectors, compliance lawyers for OSINT frameworks, and priority customer service support.",
                  gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
                  border: "border-amber-500/20",
                  iconColor: "text-amber-400"
                }
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative p-6 rounded-2xl border ${item.border} bg-surface/20 backdrop-blur-xl overflow-hidden flex flex-col`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} pointer-events-none opacity-50`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-background/50 border border-border/10 ${item.iconColor}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black text-text-primary uppercase tracking-tight italic mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────── */}
      <section className="py-28 px-6 border-t border-border/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/15 via-background to-background pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-widest mb-8 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Flame className="w-3.5 h-3.5" />
              Founding Slots Depleting
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter leading-none mb-6 uppercase italic">
              Lock In Your Tier.{" "}
              <span className="text-accent">Today.</span>
            </h2>
            <p className="text-lg text-text-secondary font-medium mb-10 max-w-xl mx-auto leading-relaxed">
              Once founding slots sell out, these prices are gone forever. Monthly billing starts Q4 2026 at 3–6x the cost.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/checkout?plan=command_center">
                <Button
                  size="lg"
                  className="font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl shadow-2xl bg-accent hover:bg-accent-hover text-white shadow-accent/20 transform hover:scale-[1.02] transition-all"
                >
                  Get Command Center — ${ltdTiers.command_center.price}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="lg"
                  className="font-black uppercase tracking-widest text-xs h-14 px-8 rounded-2xl text-text-secondary hover:text-text-primary"
                >
                  Start Free Instead
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── FAQ Accordion Item ─────────────────────────────────────────────
function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border/10 bg-surface/20 backdrop-blur-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <span className="text-base font-bold text-text-primary group-hover:text-accent transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-text-tertiary shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-accent" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6">
          <p className="text-sm text-text-secondary font-medium leading-relaxed border-t border-border/10 pt-4">
            {answer}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
