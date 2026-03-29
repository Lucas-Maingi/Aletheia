"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  Hexagon, CheckCircle2, Zap, Shield, Search, Database, Fingerprint, 
  Eye, GitCommit, ChevronRight, Activity, Terminal, Sparkles, ArrowRight, Flame,
  ImageIcon, Loader2
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/landing-header";
import { Card, CardContent } from "@/components/ui/card";

const FloatingParticles = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; scale: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate only on client to avoid hydration mismatch
    const generated = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 1 + 0.5,
      duration: Math.random() * 20 + 10
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-purple-400"
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            scale: p.scale,
            opacity: Math.random() * 0.3 + 0.1
          }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, 0.4, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function Landing() {
  const [searchValue, setSearchValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        // Pre-fill investigation from Landing to New Investigation page
        sessionStorage.setItem('aletheia_pending_image', base64);
        router.push('/dashboard/investigations/new?autostart=true');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
      router.push('/dashboard/investigations/new?target=' + encodeURIComponent(searchValue) + '&autostart=true');
  };

  const trendingCases = [
    { label: "Operation Midnight", id: "CASE-902", icon: Zap },
    { label: "Syndicate X", id: "CASE-814", icon: Flame },
    { label: "Silk Road Node", id: "CASE-771", icon: Shield },
  ];

  return (
    <div className="w-full bg-background min-h-screen transition-colors duration-700">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Dark Ambient Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-[#020617] pointer-events-none -z-10" />
        <div className="absolute top-0 w-full h-[600px] bg-gradient-to-b from-purple-900/20 via-indigo-900/5 to-transparent blur-[120px] pointer-events-none -z-10" />
        
        <FloatingParticles />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center w-full mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border/10 text-text-secondary text-sm font-mono mb-8 shadow-2xl backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-accent font-bold">Aletheia OSINT v2.4</span> Engine Online
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-sans font-black text-text-primary tracking-tight leading-[1.0] mb-8 drop-shadow-2xl uppercase italic"
          >
            Resolution. <span className="text-accent underline decoration-accent/20 underline-offset-8">Instantly.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-16 leading-relaxed font-medium"
          >
            The world's most advanced autonomous OSINT engine. Deploy agent clusters to map recursive identities and resolve digital footprints in milliseconds.
          </motion.p>

          {/* Magical Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative max-w-3xl mx-auto group z-20"
          >
            {/* Glowing Backdrop */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-accent via-accent-blue to-accent rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-300 pointer-events-none" />
            
            <form onSubmit={handleSearch} className="relative flex items-stretch bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-3xl overflow-hidden gap-2">
              <div className="flex items-center flex-1 px-4 py-3 relative">
                <Search className="w-5 h-5 text-text-tertiary shrink-0" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Target Identification (Alias, Email, Domain...)"
                  className="w-full bg-transparent border-none text-text-primary text-base px-4 focus:outline-none focus:ring-0 placeholder:text-text-tertiary/50 font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Visual Intelligence Sweep"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-xl border border-white/5 text-text-tertiary hover:text-accent hover:border-accent/40 bg-white/5 transition-all flex items-center justify-center group/img"
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5 group-hover/img:scale-110 transition-transform" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-3 bg-accent hover:bg-white hover:text-accent text-white px-8 py-4 rounded-xl font-black transition-all transform hover:scale-[1.02] shadow-xl group/btn uppercase tracking-widest text-[10px]"
                >
                  Initiate Sweep
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
            <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_var(--success)]" />
                    Secure_Node_Active
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_5px_var(--accent)]" />
                    99.9% Integrity
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="agents" className="py-24 bg-surface/5 relative border-t border-border/10 backdrop-blur-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-6 tracking-tight uppercase italic">Autonomous Intel Agents.</h2>
            <p className="text-text-secondary text-lg font-medium leading-relaxed">Deploy specialized clusters to recursively hunt, verify, and map target footprints across the global intelligence network.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "BioAgent", icon: Fingerprint, desc: "Surgically traces biographical data, familial links, and professional histories across 400+ secured registries.", color: "text-purple-500", bg: "bg-purple-500/10", border: 'border-purple-500/20' },
              { title: "InfraAgent", icon: Database, desc: "Maps infrastructure footprints including DNS registrations, IP associations, and historical network correlations.", color: "text-accent", bg: "bg-accent/10", border: 'border-accent/20' },
              { title: "BreachAgent", icon: Shield, desc: "Cross-references credential vulnerabilities against 10B+ records in secured dark-web intelligence vaults.", color: "text-indigo-500", bg: "bg-indigo-500/10", border: 'border-indigo-500/20' },
            ].map((agent, i) => (
              <motion.div
                key={agent.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative p-10 rounded-3xl bg-surface/40 border ${agent.border} hover:border-accent/40 shadow-2xl transition-all duration-700 overflow-hidden backdrop-blur-xl`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent blur-3xl rounded-bl-full`} />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${agent.bg} ${agent.color} shadow-inner border border-border/10 group-hover:scale-110 transition-transform duration-500`}>
                  <agent.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-4 flex items-center gap-3 uppercase tracking-tighter italic">
                  {agent.title}
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-background/5 border-border/10 text-text-tertiary">Active_Node</Badge>
                </h3>
                <p className="text-text-secondary text-sm font-medium leading-relaxed mb-8">{agent.desc}</p>
                <div className="pt-6 border-t border-border/10 flex items-center justify-between text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-accent" /> 99.9% Integrity</span>
                  <span className="flex items-center gap-2 tracking-[0.1em] text-accent/80 font-mono">RECURSION_ON</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Intel Workflow Section */}
      <section className="py-24 border-t border-border/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 mb-6 px-4 py-1.5 uppercase font-black tracking-widest text-[10px]">Strategic Evolution</Badge>
                <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter leading-none mb-6 uppercase italic">From Insight <br/>to Intelligence.</h2>
                <p className="text-xl text-text-secondary leading-relaxed font-medium">Aletheia eliminates the noise. Our multi-stage correlation engine moves your investigation from speculation to verified evidence in seconds.</p>
              </div>

              <div className="space-y-6">
                 {[
                   { step: "01", title: "Target Identification", desc: "Input any known vector—alias, email, or domain—to trigger initial cluster activation." },
                   { step: "02", title: "Recursive Expansion", desc: "Autonomous agents trace secondary and tertiary links across 1000+ secured data nodes." },
                   { step: "03", title: "Evidence Synthesis", desc: "Findings are hashed, verified, and compiled into a court-ready intelligence dossier." }
                 ].map((w, idx) => (
                   <div key={idx} className="flex gap-6 group">
                      <div className="text-2xl font-black text-accent/20 group-hover:text-accent transition-colors duration-500 font-mono italic">{w.step}</div>
                      <div>
                        <h4 className="text-lg font-black text-text-primary uppercase tracking-tight mb-2 italic">{w.title}</h4>
                        <p className="text-sm text-text-secondary font-medium leading-relaxed">{w.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="relative">
               <div className="absolute -inset-4 bg-accent/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />
               <Card className="bg-surface/50 border-border/20 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-3xl">
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/10 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase text-accent tracking-[.2em] mb-1">Live Telemetry</div>
                          <div className="text-lg font-black text-text-primary uppercase">Active Signal Correlator</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="animate-pulse bg-success/10 border-success/20 text-success uppercase text-[8px] font-black tracking-widest px-2.5 py-1">Receiving_Data</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="h-4 bg-foreground/5 rounded-full overflow-hidden relative border border-border/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "65%" }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="absolute inset-0 bg-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-border/5">
                           <div className="text-[10px] font-black text-text-tertiary uppercase mb-1">Signal Confidence</div>
                           <div className="text-2xl font-black text-text-primary italic">94.8%</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-border/5">
                           <div className="text-[10px] font-black text-text-tertiary uppercase mb-1">Nodes Scanned</div>
                           <div className="text-2xl font-black text-text-primary italic">1,402</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-foreground/[0.02] p-6 rounded-2xl border border-border/10 space-y-3">
                       <div className="text-[10px] font-black text-accent uppercase tracking-widest">Synthesis Progress</div>
                       <p className="text-xs font-medium text-text-secondary leading-relaxed">Agent clusters have identified recursive link between target infrastructure and secondary alias. Mapping provenance hash...</p>
                    </div>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className="py-32 relative overflow-hidden border-t border-border/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <Badge variant="outline" className="text-purple-500 border-purple-500/20 bg-purple-500/5 mb-8 px-4 py-1.5 uppercase font-black tracking-widest text-[10px]">
              <Eye className="w-4 h-4 mr-2" /> Visual Proof Scanning
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary mb-8 tracking-tighter leading-none uppercase italic">Recursive intel,<br />verified mathematically.</h2>
            <p className="text-text-secondary text-lg font-medium mb-10 leading-relaxed max-w-xl">
              Every data point collected by Aletheia is cryptographically hashed and linked to a visual archive snapshot. Verify provenance instantly with mathematical certainty.
            </p>
            <ul className="space-y-5">
              {[
                "Automated Archive.org capturing",
                "SHA-256 Provenance Hashing on ingestion",
                "OCR and EXIF metadata extraction"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-text-primary font-mono text-sm group">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="pt-1 font-black uppercase tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            {/* Recursive Mock UI */}
            <div className="relative z-10 rounded-2xl overflow-hidden border border-border/20 shadow-3xl bg-surface/90 backdrop-blur-2xl aspect-square lg:aspect-video transform lg:-rotate-y-6 perspective-1000">
              <div className="h-10 border-b border-border/10 bg-background/50 flex items-center px-5 gap-2.5">
                <div className="w-3 h-3 rounded-full bg-error/20 border border-error/10" />
                <div className="w-3 h-3 rounded-full bg-warning/20 border border-warning/10" />
                <div className="w-3 h-3 rounded-full bg-success/20 border border-success/10" />
                <div className="ml-auto text-[10px] text-text-tertiary font-black tracking-widest uppercase">operative-live-feed.sh</div>
              </div>
              <div className="p-8 font-mono text-sm text-text-primary space-y-4 relative h-full">
                <div className="flex items-center gap-3">
                  <span className="text-accent">aletheia</span><span className="text-text-tertiary">~</span><span className="text-accent">❯</span> <span className="animate-pulse">scan --target @johndoe</span>
                </div>
                <div className="text-text-tertiary">Initializing clusters... <span className="text-accent underline decoration-accent/20 underline-offset-4">[AUTHORIZED]</span></div>
                <div className="text-text-tertiary">Extracting EXIF data... <span className="text-accent">FOUND (4)</span></div>
                <div className="pl-6 border-l-2 border-accent/20 mt-4 space-y-2 text-xs">
                  <div>↳ GPS: <span className="text-accent font-black">37.7749° N, 122.4194° W</span></div>
                  <div>↳ Device: <span className="text-accent font-black">iPhone 14 Pro Max</span></div>
                  <div>↳ Timestamp: <span className="text-accent font-black">2026-03-25T14:49:05Z</span></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
            {/* Decorative blurs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 blur-[100px] -z-10" />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-32 bg-surface/5 border-t border-border/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 mb-8 px-5 py-2 uppercase font-black text-[10px] tracking-[.4em]">
              THE INTELLIGENCE MARKETPLACE
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black text-text-primary mb-10 tracking-tighter uppercase italic leading-[0.9]">
              Elite Tools.<br/>Zero Friction.
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed mb-16 font-medium">
              From individual target expansions to enterprise-grade cluster deployment. Select your operational tier and secure your edge today.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
               <div className="p-8 rounded-3xl bg-surface border border-border/20 text-left backdrop-blur-3xl shadow-2xl hover:border-accent/40 transition-all duration-500 group/tier">
                  <div className="text-accent font-black text-2xl mb-3 uppercase italic tracking-tighter group-hover/tier:translate-x-1 transition-transform">Tactical Pro</div>
                  <p className="text-sm text-text-secondary font-semibold leading-relaxed">Full recursive search, priority agent clusters, and forensic report generation.</p>
               </div>
               <div className="p-8 rounded-3xl bg-surface border border-border/20 text-left backdrop-blur-3xl shadow-2xl hover:border-success/40 transition-all duration-500 group/tier">
                  <div className="text-success font-black text-2xl mb-3 uppercase italic tracking-tighter group-hover/tier:translate-x-1 transition-transform">Lifetime Elite</div>
                  <p className="text-sm text-text-secondary font-semibold leading-relaxed">Permanent infrastructure access. No monthly fees. Unlimited recursive depth.</p>
               </div>
            </div>

            <Link href="/pricing" className="inline-flex items-center justify-center gap-4 bg-accent hover:bg-accent-hover text-white px-16 py-6 rounded-2xl font-black uppercase tracking-widest text-sm shadow-glow transition-all transform hover:scale-[1.05] active:scale-95 group">
               View All Operations & Tiers <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
