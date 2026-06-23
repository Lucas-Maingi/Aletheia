"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Activity, Fingerprint, Database, ChevronDown, ChevronUp, Terminal,
  MapPin, Clock, ArrowUpRight, Crosshair, ShieldAlert, Cpu, Trash2, RefreshCw,
  Search, MessageSquare, ImageIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProGateBanner } from "@/components/dashboard/pro-gate-banner";

interface InvestigationProp {
    id: string;
    title: string;
    target: string;
    status: string;
    progress: number;
    details: string;
    leads: number;
    source: string;
    updatedAt?: Date | string;
}

export function DashboardClient({ 
    investigations, 
    totalInvestigations,
    signalYield,
    activeOps,
    recentDiscoveries = [],
    isPro = false,
    freeLimit = 5,
}: { 
    investigations: InvestigationProp[];
    totalInvestigations: number;
    signalYield: number;
    activeOps: number;
    recentDiscoveries?: any[];
    isPro?: boolean;
    freeLimit?: number;
}) {
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [localInvestigations, setLocalInvestigations] = useState<InvestigationProp[]>(investigations);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 3.5 * 1024 * 1024) {
              alert("Image is too large (max 3.5MB). Please use a smaller file.");
              return;
          }
          const reader = new FileReader();
          reader.onload = (ev) => {
              sessionStorage.setItem('aletheia_pending_image', ev.target?.result as string);
              router.push('/dashboard/investigations/new?autostart=true');
          };
          reader.readAsDataURL(file);
      }
  };

  // Combine and sort missions chronologically (Dossiers + Chats)
  const unifiedMissions = [...localInvestigations].sort((a, b) => 
    new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  );

  useEffect(() => {
    setLocalInvestigations(investigations);
  }, [investigations]);

  const dossiers = localInvestigations.filter(i => i.source === 'dossier');
  const chats = localInvestigations.filter(i => i.source === 'chat');

  const topStats = [
    { label: "Signal", value: signalYield.toLocaleString(), icon: Cpu, color: "text-accent", glow: "bg-accent/10", detail: "Total artifacts captured" },
    { label: "Active Operations", value: activeOps.toString(), icon: Activity, color: "text-emerald-400", glow: "bg-emerald-400/10", detail: "Scanning background data", active: activeOps > 0 },
    { label: "Mission Index", value: totalInvestigations.toString(), icon: Database, color: "text-text-tertiary", glow: "bg-white/5", detail: "Archived dossiers & briefings" }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-10 h-full flex flex-col pb-10">
      
      {/* HUD Header & Mission Control */}
      <section className="shrink-0 pt-0">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-8 relative z-20">
          
          <div className="flex-1 w-full max-w-[800px] relative">
            {/* High-Energy Pulsing Background behind the search bar */}
            <div className="absolute -inset-10 bg-gradient-to-r from-accent/20 to-purple-500/20 blur-3xl opacity-30 rounded-full pointer-events-none" />
            
            <div className="relative z-10">
                <div className="text-[11px] font-black text-accent uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_12px_rgba(0,240,255,0.8)]" />
                    System_Status: Operational_Node_Active
                </div>
                
                <div className="relative group/search-main flex items-center">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-accent opacity-50 group-hover/search-main:opacity-100 transition-opacity duration-300" />
                    
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchQuery) {
                                router.push(`/dashboard/investigations/new?target=${encodeURIComponent(searchQuery)}&autostart=true`);
                            }
                        }}
                        placeholder="Search Identity, Domain, or Signal..."
                        className="w-full h-14 md:h-[72px] pl-12 md:pl-16 pr-[100px] sm:pr-[130px] md:pr-[200px] bg-surface/60 backdrop-blur-[40px] border border-border/20 rounded-2xl text-sm md:text-xl font-bold text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all shadow-2xl shadow-accent/5 focus:shadow-[0_0_40px_rgba(0,240,255,0.15)]"
                    />
                    
                    {/* Integrated action buttons inside the search bar */}
                    <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2">
                        {/* Direct Visual Search Upload Button */}
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Direct Visual Scan (Select Image)"
                            className="p-1.5 md:p-3 rounded-lg md:rounded-xl border border-border/10 text-text-tertiary hover:text-accent hover:border-accent/30 hover:bg-accent/10 transition-all active:scale-95"
                        >
                            <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />

                        <button 
                            onClick={() => searchQuery && router.push(`/dashboard/investigations/new?target=${encodeURIComponent(searchQuery)}&autostart=true`)}
                            className="h-9 md:h-12 px-2.5 md:px-6 rounded-lg md:rounded-xl bg-accent text-background font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-white hover:text-accent transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-95 flex items-center gap-1.5 md:gap-2 group/btn"
                        >
                            <span className="hidden sm:inline">Target_Sweep</span>
                            <Search className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
          </div>

          <div className="hidden lg:block text-right">
             <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1 opacity-50">Local Intelligence Time</div>
             <div className="text-3xl font-bold text-text-primary tabular-nums tracking-tighter">
                {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {topStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface/30 backdrop-blur-2xl border border-white/5 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-xl relative overflow-hidden group hover:border-accent/30 hover:-translate-y-1 transition-all duration-500 cursor-default"
            >
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center border border-accent/20 bg-accent/5 ${stat.color}`}>
                    <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${(stat as any).active ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              <div>
                <h3 className="text-text-secondary font-black text-[8px] md:text-[9px] uppercase tracking-[0.15em] md:tracking-[0.2em] mb-0.5 md:mb-1">{stat.label}</h3>
                <div className="text-base sm:text-2xl md:text-3xl font-black text-text-primary tracking-tighter flex items-baseline gap-1 md:gap-2">
                    {stat.value}
                    {stat.label.includes("Signal") && <span className="hidden md:inline text-[10px] text-accent opacity-60 uppercase tracking-widest font-black">Artifacts</span>}
                </div>
                <p className="hidden md:block text-[10px] text-text-secondary mt-2 font-medium opacity-60">{stat.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pro Gate Banner — shown only to free users */}
      <ProGateBanner
        currentCount={totalInvestigations}
        freeLimit={freeLimit}
        isPro={isPro}
      />

      {/* Tactical Feed & Unified Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Main Activity Timeline */}
        <section className="order-2 lg:order-1 lg:col-span-7 flex flex-col min-h-0 bg-surface/10 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              <h2 className="text-[13px] font-bold text-text-secondary uppercase tracking-[0.2em]">Operational Chronology</h2>
            </div>
            <Link href="/dashboard/investigations" className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] hover:text-white transition-all">
              Comprehensive_Archive
            </Link>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar pb-4 pr-2">
            {unifiedMissions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/[0.02] text-text-tertiary text-[10px] font-mono uppercase tracking-[0.3em]">
                    No active mission telemetry.
                </div>
            ) : unifiedMissions.map((inv, i) => {
              const isExpanded = expandedCase === inv.id;
              const isChat = inv.source === 'chat';
              
              return (
                <motion.div 
                  key={inv.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  layout
                  className={`group border rounded-2xl transition-all duration-500 overflow-hidden relative ${
                    isExpanded 
                      ? 'bg-surface border-accent/40 shadow-2xl' 
                      : isChat 
                        ? 'bg-emerald-500/[0.03] border-emerald-500/10 hover:border-emerald-500/30'
                        : 'bg-surface/40 border-border/10 hover:border-border/30 shadow-sm'
                  }`}
                >
                  <button 
                    onClick={() => setExpandedCase(isExpanded ? null : inv.id)}
                    className="w-full p-4 flex items-center justify-between text-left focus:outline-none relative z-10"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-500 ${
                        inv.status === 'Critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                        isChat ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        'bg-accent/10 border-accent/20 text-accent'
                      }`}>
                        {isChat ? <MessageSquare className="w-4 h-4" /> : <Crosshair className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary tracking-tight mb-0.5">
                            {isChat ? inv.title.replace(/^Chat:\s?/, '') : inv.title}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-80">{isChat ? 'AI Session' : 'Tactical Dossier'}</span>
                            <div className="w-1 h-1 rounded-full bg-border/20" />
                            <span className="text-[10px] text-text-secondary font-mono font-bold">{inv.target}</span>
                        </div>
                      </div>
                    </div>
                    
                            <div className="flex items-center gap-4">
                                <div className={`p-1.5 rounded-md transition-all ${isExpanded ? 'rotate-180 bg-accent/20 text-accent' : 'text-text-tertiary opacity-60'}`}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 overflow-hidden"
                      >
                         <div className="p-4 bg-foreground/[0.04] border border-border/10 rounded-xl text-[11px] text-text-secondary leading-relaxed italic mb-4 font-medium">
                             "{inv.details}"
                         </div>
                         
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/5 mt-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`text-[8px] font-bold tracking-[0.2em] px-2 py-0.5 rounded border-opacity-30 ${
                                    isChat ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-accent/10 border-accent/20 text-accent'
                                }`}>
                                   {isChat ? 'Briefing' : 'Discovery'}
                                </Badge>
                                 <span className="text-[9px] font-mono text-text-tertiary font-black uppercase">Confirmed_Record</span>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <Link 
                                    href={isChat ? `/dashboard/chat?id=${inv.id}` : `/dashboard/investigations/${inv.id}`}
                                    className={`h-8 px-4 rounded-lg font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none ${
                                        isChat ? 'bg-emerald-500 text-background hover:bg-white' : 'bg-accent text-background hover:bg-white'
                                    }`}
                                >
                                    Access Intelligence <ArrowUpRight className="w-3 h-3" />
                                </Link>
                                 <button
                                    onClick={() => setPendingDeleteId(inv.id)}
                                    className="p-2 rounded-lg bg-foreground/[0.05] text-text-tertiary hover:text-white hover:bg-rose-500 transition-all border border-border/10 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Tactical Intelligence Feed (Actionable Insights) */}
        <section className="order-1 lg:order-2 lg:col-span-5 flex flex-col min-h-0 bg-surface/10 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              <h2 className="text-[13px] font-bold text-text-secondary uppercase tracking-[0.2em]">Tactical Feed</h2>
            </div>
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.2em] animate-pulse">
              Live_Telemetry
            </span>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar pb-4 pr-2 flex-1">
            {recentDiscoveries.length === 0 ? (
              // Simulated High-Quality Threat-Intel Alert Items when scan data is not yet resolved
              <div className="space-y-3">
                {[
                  {
                    title: "Dark Web Leak Monitoring Active",
                    detail: "Aletheia is ready to sweep 40+ repositories for credential leaks.",
                    badge: "HIGH CONFIDENCE",
                    badgeColor: "bg-accent/10 border-accent/20 text-accent",
                    time: "Ready",
                    icon: ShieldAlert
                  },
                  {
                    title: "Identity Association Tracker",
                    detail: "Target sweeps correlate cross-platform accounts and usernames.",
                    badge: "READY",
                    badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                    time: "Active",
                    icon: Fingerprint
                  },
                  {
                    title: "Subdomain & DNS Exposure Node",
                    detail: "DNS records (MX, TXT, SPF) will highlight architectural vulnerabilities.",
                    badge: "READY",
                    badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                    time: "Active",
                    icon: Database
                  },
                  {
                    title: "Visual Footprint Sweep Ready",
                    detail: "Upload images to perform reverse-image threat vectors scanning.",
                    badge: "DEMO MODE",
                    badgeColor: "bg-purple-500/10 border-purple-500/20 text-purple-400",
                    time: "Active",
                    icon: ImageIcon
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-surface/30 border border-border/10 hover:border-accent/20 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-tertiary shrink-0">
                        <item.icon className="w-4 h-4 text-text-tertiary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-text-primary truncate">{item.title}</span>
                          <span className="text-[8px] font-mono text-text-tertiary uppercase">{item.time}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-relaxed mb-3">{item.detail}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[8px] font-mono font-black tracking-wider px-2 py-0.5 rounded border-opacity-30 ${item.badgeColor}`}>
                            {item.badge}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              recentDiscoveries.map((discovery: any) => {
                let badgeColor = "bg-accent/10 border-accent/20 text-accent";
                if (discovery.confidenceLabel === "HIGH") {
                  badgeColor = "bg-rose-500/10 border-rose-500/30 text-rose-500";
                } else if (discovery.confidenceLabel === "MEDIUM") {
                  badgeColor = "bg-accent/10 border-accent/20 text-accent";
                } else {
                  badgeColor = "bg-text-tertiary/10 border-text-tertiary/20 text-text-tertiary";
                }

                let Icon = ShieldAlert;
                if (discovery.type === "image" || discovery.type === "screenshot") Icon = ImageIcon;
                else if (discovery.type === "email" || discovery.type === "username") Icon = Fingerprint;
                else if (discovery.type === "link" || discovery.type === "url") Icon = Database;

                return (
                  <div key={discovery.id} className="p-4 rounded-2xl bg-surface/30 border border-border/10 hover:border-accent/20 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-tertiary shrink-0">
                        <Icon className="w-4 h-4 text-text-tertiary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-text-primary truncate">{discovery.title}</span>
                          <span className="text-[8px] font-mono text-text-tertiary uppercase">
                            {new Date(discovery.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-relaxed mb-3 line-clamp-3">{discovery.content}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[8px] font-mono font-black tracking-wider px-2 py-0.5 rounded border-opacity-30 ${badgeColor}`}>
                              {discovery.confidenceLabel}_CONFIDENCE
                            </Badge>
                            <span className="text-[9px] font-mono font-bold text-text-tertiary max-w-[120px] truncate">
                              in {discovery.investigation?.title || "Dossier"}
                            </span>
                          </div>
                          <Link 
                            href={`/dashboard/investigations/${discovery.investigationId}`}
                            className="text-[9px] font-black uppercase text-accent hover:underline flex items-center gap-0.5"
                          >
                            Inspect <ArrowUpRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
