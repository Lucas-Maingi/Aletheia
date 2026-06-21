"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Shield, Database, Sparkles, Flame, ChevronDown, Check, X,
  HelpCircle, Cpu, Lock, Terminal, Globe, Network, Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/footer";
import { ContentBackButton } from "@/components/landing/content-back-button";
import { LAUNCH_CONFIG } from "@/lib/launch-config";

// ─── FAQ Categories ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "technology", label: "Technology & Connectors", icon: Network },
  { id: "privacy", label: "Privacy & Stealth", icon: Shield },
  { id: "ai", label: "AI Dossier Synthesizer", icon: Cpu },
  { id: "ltd", label: "Lifetime Deal & Billing", icon: Coins },
  { id: "api", label: "Integrations & API", icon: Terminal },
];

// ─── Rich FAQ Dataset ────────────────────────────────────────────────
const FAQS = [
  {
    category: "technology",
    q: "How does Aletheia collect open-source intelligence (OSINT)?",
    a: "Aletheia operates a multi-threaded asynchronous polling engine. When an investigation is triggered on a target identifier (such as an email address, username, or domain), the platform queries a grid of 17+ specialized connectors in parallel. These connectors interface with public search registries, WHOIS caches, domain registries, public blockchain ledgers, and credential leak data. All queries are passive, meaning we only request pre-collected or cached public data without direct contact.",
  },
  {
    category: "technology",
    q: "What connectors are currently supported, and how does ingestion work?",
    a: "Our core connectors cover multiple intelligence vectors: username checks across 25+ major social networks, WHOIS registration details, DNS configurations, IP geolocations, blockchain transactional ledgers (Ethereum/Bitcoin), dark web paste leaks, and credential breach databases. As each connector returns its payload, our system matches, validates, and hashes the records using SHA-256 to guarantee data provenance before passing them to the AI parser.",
  },
  {
    category: "technology",
    q: "Does Aletheia perform active network penetration tests or bypass access controls?",
    a: "Absolutely not. Aletheia operates strictly within the boundaries of passive open-source intelligence (OSINT). We do not perform port scans, execute exploits, run vulnerability checks, or bypass login authentications on target servers. We query only open, public APIs, web caches, and registries. Our operations are fully compliant with standard cybersecurity investigation frameworks.",
  },
  {
    category: "privacy",
    q: "Is the scan target notified when I run an investigation?",
    a: "No. Since Aletheia queries only cached public search indices, WHOIS directories, and third-party threat data aggregators, our servers never touch or contact the target's direct system. Your investigations are 100% stealthy, and the target is never alerted.",
  },
  {
    category: "privacy",
    q: "How does Aletheia secure my search logs? What is your zero-knowledge architecture?",
    a: "We implement a strict zero-knowledge model. All targets, raw evidence JSON payloads, and generated dossiers are encrypted at rest using AES-256 keys. These keys are linked to your session identity and account context. No Aletheia staff or database administrators can decrypt, inspect, or search your investigation history. Your work remains completely private.",
  },
  {
    category: "privacy",
    q: "Can third parties, competitors, or auditing bodies access my case files?",
    a: "No. Since all data is encrypted client-side using zero-knowledge secrets and sandboxed inside your dedicated database tenancy, it is mathematically impossible for third parties to audit or dump your target sweeps. You have absolute ownership and control over your dataset.",
  },
  {
    category: "ai",
    q: "How does the AI Executive Dossier generator synthesize findings?",
    a: "Once all connectors complete data ingestion, Aletheia compiles the raw evidence into a unified JSON schema. This schema is fed into a secure, sandboxed context window running enterprise LLM models. The model parses the data to correlate platform identities, filter false positives, calculate risk exposure ratings, and summarize findings into an executive intelligence dossier. The resulting report compiles hours of manual analysis into seconds.",
  },
  {
    category: "ai",
    q: "Are my targets' details or my search queries used to train public AI models?",
    a: "Never. We query all AI models via secure enterprise-tier pipelines under strict Zero Data Retention (ZDR) agreements. Your data is sent encrypted, processed transiently in memory, and immediately deleted by the AI provider upon response delivery. It is never logged, cached, or used to train public models.",
  },
  {
    category: "ltd",
    q: "What does \"lifetime access\" actually cover on the founding member tiers?",
    a: "Lifetime access means you pay once and own access to the platform forever. You will receive all future product updates, security patches, new OSINT connectors, and LLM model upgrades without any monthly subscriptions, usage upcharges, or hidden fees. Your early support locks in your license permanently.",
  },
  {
    category: "ltd",
    q: "What happens to my account when Aletheia switches to monthly subscription billing in Q4 2026?",
    a: "Existing lifetime deal (LTD) holders will be permanently grandfathered. Your account will remain fully unlocked without any subscription requests. We are committed to protecting early backers; founding members will retain all core features and receive priority access to enterprise feature updates.",
  },
  {
    category: "ltd",
    q: "Can I upgrade my lifetime tier to a higher one later?",
    a: "Yes. You can upgrade from Analyst Pro to Command Center or Agency Arsenal at any time directly through your dashboard. You will only pay the difference between the pricing tiers, and your founding member discount remains locked in.",
  },
  {
    category: "ltd",
    q: "What is your money-back guarantee policy?",
    a: `We offer a full ${LAUNCH_CONFIG.MONEY_BACK_DAYS}-day money-back guarantee. If Aletheia does not fit your recon workflow or meet your security standards, contact our support desk within 30 days of purchase for a full refund, no questions asked.`,
  },
  {
    category: "api",
    q: "Do you offer API access for automated investigations?",
    a: "Yes. Both our Command Center and Agency Arsenal tiers include access to our developer portal and REST API. You can programmatically initiate footprint sweeps on emails, domains, or usernames, fetch raw evidence JSON payloads, or download compiled markdown dossiers to pipe directly into your SIEM, SOAR, or custom case manager.",
  },
  {
    category: "api",
    q: "Can I run bulk investigations using CSV files?",
    a: "Yes. The Agency Arsenal tier includes a batch processing engine. You can upload CSV spreadsheets containing lists of targets, and our queue runner will process them concurrently in the background. Once finished, you can download all compiled dossiers and evidence structures in a zipped package.",
  },
  {
    category: "api",
    q: "Can I write custom connectors for proprietary data feeds?",
    a: "Yes. The Agency Arsenal tier supports custom connector webhooks. You can define your own API ingestion points and map their returned payloads directly into the Aletheia identity graph and AI dossier context window.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered FAQs based on category selection and search query
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="w-full bg-background min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pt-32 pb-24">
        {/* Back Button */}
        <div className="flex justify-start">
          <ContentBackButton />
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge
            variant="outline"
            className="px-4 py-1.5 border-accent/20 bg-accent/5 text-accent uppercase font-black tracking-widest text-[10px]"
          >
            Support Center
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight leading-none">
            Frequently Asked <span className="text-accent">Questions</span>
          </h1>
          <p className="text-text-secondary text-base md:text-lg font-medium leading-relaxed">
            Get clear, straight answers about Aletheia's OSINT connectors, zero-knowledge security models, AI dossier synthesis, and lifetime founding plans.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-xl group-hover:bg-accent/10 transition-colors pointer-events-none" />
            <div className="relative flex items-center bg-surface/50 border border-border/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
              <Search className="w-5 h-5 text-accent mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search OSINT technology, zero-knowledge, lifetime deals, API integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-tertiary font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-foreground/5 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Tab Swiper */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  isActive
                    ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                    : "bg-surface/20 border-border/5 text-text-secondary hover:text-text-primary hover:bg-surface/40 hover:border-border/25"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQs List */}
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq, i) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} index={i} />
            ))}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-border/10 rounded-2xl bg-surface/5"
            >
              <HelpCircle className="w-10 h-10 text-accent/40 mx-auto mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-text-primary uppercase mb-2">No matching questions found</h3>
              <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                We couldn't find any questions matching "{searchQuery}". Try searching for terms like "connectors", "private", "stealth", or "API".
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─── FAQ Accordion Item Component ───────────────────────────────────
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
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-border/10 bg-surface/20 backdrop-blur-xl overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left group transition-colors"
      >
        <span className="text-base font-bold text-text-primary group-hover:text-accent transition-colors pr-4 leading-snug">
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
          <p className="text-sm text-text-secondary font-medium leading-relaxed border-t border-border/10 pt-4 whitespace-pre-line">
            {answer}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
