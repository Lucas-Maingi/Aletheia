"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Activity, Fingerprint, Database, ChevronDown, ChevronUp, Terminal,
  MapPin, Clock, ArrowUpRight, Crosshair, ShieldAlert, Cpu, Trash2, RefreshCw,
  Search, MessageSquare
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
    <div className="w-full max-w-[1400px] mx-auto space-y-10 h-full flex flex-col pt-2 pb-10">
      
      {/* HUD Header & Mission Control */}
      <section className="shrink-0 pt-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-8">
          <div className="flex-1 w-full max-w-2xl">
            <div className="text-[11px] font-black text-accent uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                System_Status: Operational_Node_Active
            </div>
            
            <div className="relative group/search-main">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent opacity-50 group-hover/search-main:opacity-100 transition-opacity duration-300" />
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
                    className="w-full h-16 pl-14 pr-36 bg-surface/40 backdrop-blur-[40px] border border-border/20 rounded-2xl text-lg font-bold text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all shadow-2xl shadow-accent/5 focus:shadow-[0_0_30px_rgba(0,240,255,0.15)]"
                />
                <button 
                   onClick={() => searchQuery && router.push(`/dashboard/investigations/new?target=${encodeURIComponent(searchQuery)}&autostart=true`)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl bg-accent text-background font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-accent transition-all shadow-lg active:scale-95 flex items-center gap-2 group/btn"
                >
                    Target_Sweep
                    <Search className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                </button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface/30 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-accent/30 hover:-translate-y-1 transition-all duration-500 cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-accent/20 bg-accent/5 ${stat.color}`}>
                    <stat.icon className={`w-5 h-5 ${(stat as any).active ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              <div>
                <h3 className="text-text-secondary font-black text-[9px] uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                <div className="text-3xl font-black text-text-primary tracking-tighter flex items-baseline gap-2">
                    {stat.value}
                    {stat.label.includes("Signal") && <span className="text-[10px] text-accent opacity-60 uppercase tracking-widest font-black">Artifacts</span>}
                </div>
                <p className="text-[10px] text-text-secondary mt-2 font-medium opacity-60">{stat.detail}</p>
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
      <div className="flex flex-col gap-8 flex-1 min-h-0">
        
        {/* Main Activity Timeline */}
        <section className="flex flex-col min-h-0 bg-surface/10 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              <h2 className="text-[13px] font-bold text-text-secondary uppercase tracking-[0.2em]">Operational Chronology</h2>
            </div>
            <Link href="/dashboard/investigations" className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] hover:text-white transition-all">
              Comprehensive_Archive
            </Link>
          </div>

          <div className="space-y-4 overflow-y-auto no-scrollbar pb-4 pr-1">
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
                         
                         <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`text-[8px] font-bold tracking-[0.2em] px-2 py-0.5 rounded border-opacity-30 ${
                                    isChat ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-accent/10 border-accent/20 text-accent'
                                }`}>
                                   {isChat ? 'Briefing' : 'Discovery'}
                                </Badge>
                                 <span className="text-[9px] font-mono text-text-tertiary font-black uppercase">Confirmed_Record</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Link 
                                    href={isChat ? `/dashboard/chat?id=${inv.id}` : `/dashboard/investigations/${inv.id}`}
                                    className={`h-8 px-4 rounded-lg font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                                        isChat ? 'bg-emerald-500 text-background hover:bg-white' : 'bg-accent text-background hover:bg-white'
                                    }`}
                                >
                                    Access Intelligence <ArrowUpRight className="w-3 h-3" />
                                </Link>
                                 <button
                                    onClick={() => setPendingDeleteId(inv.id)}
                                    className="p-2 rounded-lg bg-foreground/[0.05] text-text-tertiary hover:text-white hover:bg-rose-500 transition-all border border-border/10"
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
      </div>
    </div>
  );
}
