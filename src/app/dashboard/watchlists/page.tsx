"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Eye, Shield, Trash2, Plus, Pause, Play, 
  Target, Activity, AlertCircle, CheckCircle2, 
  Search, Globe, Mail, User, ShieldAlert, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import Link from "next/link";

interface WatchlistItem {
  id: string;
  name: string;
  targetType: string;
  targetValue: string;
  status: 'active' | 'paused';
  lastChecked: string | null;
  _count: { alerts: number };
}

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // New Watchlist Form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("email");
  const [newValue, setNewValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const usageRes = await fetch('/api/user/usage');
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setPlan(usageData.plan || 'free');
        } else {
          setPlan('free');
        }
        await fetchWatchlists();
      } catch (err) {
        console.error("Watchlists init error:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchWatchlists = async () => {
    try {
      const res = await fetch('/api/watchlists');
      const data = await res.json();
      setWatchlists(data);
    } catch (err) {
      console.error("Failed to fetch watchlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName || !newValue) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, targetType: newType, targetValue: newValue })
      });
      
      if (res.ok) {
        setIsAddOpen(false);
        setNewName("");
        setNewValue("");
        fetchWatchlists();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create watchlist");
      }
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (item: WatchlistItem) => {
    const newStatus = item.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/watchlists/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchWatchlists();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("This will permanently terminate metadata ingestion for this target. Proceed?")) return;
    try {
      const res = await fetch(`/api/watchlists/${id}`, { method: 'DELETE' });
      if (res.ok) fetchWatchlists();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (!loading && plan === 'free') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="relative overflow-hidden bg-surface/20 border-accent/20 shadow-[0_0_80px_rgba(0,240,255,0.08)] backdrop-blur-3xl p-8 md:p-12 rounded-3xl group">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[120px] rounded-full pointer-events-none -z-10 group-hover:bg-accent/15 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none opacity-50" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            {/* Icon Block */}
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,240,255,0.15)] group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-accent/20 blur-md rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <Shield className="w-12 h-12 text-accent relative z-10 animate-pulse" />
            </div>

            {/* Copy Block */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Badge variant="outline" className="px-4 py-1.5 border-accent/30 bg-accent/10 text-accent uppercase font-black tracking-widest text-[9px]">
                <Zap className="w-3 h-3 mr-1.5 fill-accent animate-pulse" /> Premium Surveillance Feature
              </Badge>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-white uppercase tracking-tight italic">
                Unlock 24/7 <br />
                <span className="text-accent">Autonomous Watchlists</span>
              </h1>
              <p className="text-text-muted text-sm md:text-base leading-relaxed font-sans max-w-xl">
                Continuous surveillance nodes scan global dark web leaks, social graphs, carrier records, and facial recognition registers. Deploy intelligence pulses to automatically monitor targets and receive instant threat telemetry.
              </p>
              
              {/* Feature Check Grid */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2 text-[11px] font-mono uppercase tracking-wider text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>24/7 Passive Scanning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Real-Time Ingestion Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Email & Webhook Feeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Biometric Leak Sweep</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button className="w-full bg-accent text-slate-900 font-black hover:brightness-110 shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest text-xs h-11 px-8">
                    Upgrade to Command Center
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full border border-white/10 text-white hover:bg-white/5 uppercase tracking-widest text-xs h-11 px-8">
                    Back to Terminal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Watchlist Control</h1>
          </div>
          <p className="text-text-muted text-sm max-w-2xl font-sans leading-relaxed">
            Autonomous persistence nodes monitor targets 24/7 across global archives. Alerts are triggered upon new biometric discovery, data leaks, or node activity.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-slate-900 font-bold hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Plus className="w-4 h-4 mr-2" /> Initialize Monitor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-white/5 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl border-b border-white/5 pb-4">New Surveillance Node</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Node Identifier (Name)</label>
                <Input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Operation Shadow Ghost" 
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Target Vector</label>
                <select 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm focus:ring-1 focus:ring-accent outline-none appearance-none"
                >
                  <option value="email">Email Address</option>
                  <option value="username">Social Username / Handle</option>
                  <option value="domain">Domain Name</option>
                  <option value="phone">Phone Number</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Vector Value</label>
                <Input 
                  value={newValue} 
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={newType === 'email' ? 'target@protonmail.com' : 'target_handle'} 
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreate} 
                className="w-full bg-accent text-slate-900 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deploying Node..." : "Initiate Surveillance"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-30 animate-pulse">
            <Shield className="w-12 h-12 mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Authenticating Relay Access...</p>
        </div>
      ) : watchlists.length === 0 ? (
        <Card className="bg-surface/30 border-dashed border-white/10 p-20 text-center">
            <div className="max-w-xs mx-auto space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 italic text-white/20 font-serif text-2xl">?</div>
                <h3 className="text-white font-bold">No active monitors deployed.</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  Deploy your first persistent surveillance node to start tracking targets 24/7.
                </p>
                <Button onClick={() => setIsAddOpen(true)} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                    Deploy Prototype Node
                </Button>
            </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {watchlists.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="bg-surface border-white/5 hover:border-white/10 transition-all overflow-hidden group">
                  <div className={`h-1 w-full ${item.status === 'active' ? 'bg-accent' : 'bg-slate-700'}`} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        {item.targetType === 'email' ? <Mail className="w-4 h-4 text-slate-400" /> :
                         item.targetType === 'username' ? <User className="w-4 h-4 text-slate-400" /> :
                         <Globe className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item._count.alerts > 0 && (
                          <Badge className="bg-danger text-white border-0 text-[10px] px-1.5 animate-pulse">
                            {item._count.alerts} Alerts
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-[8px] uppercase tracking-tighter ${item.status === 'active' ? 'border-success/30 text-success' : 'border-slate-700 text-slate-500'}`}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-white font-bold truncate group-hover:text-accent transition-colors">{item.name}</h3>
                      <p className="text-[11px] font-mono text-text-muted truncate mt-1 opacity-70 italic">{item.targetValue}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-text-muted">
                        <span>Reliability Mode</span>
                        <span className="text-white">ULTRA-HIGH</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-text-muted">
                        <span>Last Integrity Check</span>
                        <span className="text-white">{item.lastChecked ? new Date(item.lastChecked).toLocaleTimeString() : 'Awaiting Pulse'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toggleStatus(item)}
                        className={`flex-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
                          item.status === 'active' ? 'text-text-muted hover:text-warning' : 'text-success hover:bg-success/10'
                        }`}
                      >
                        {item.status === 'active' ? (
                          <><Pause className="w-3 h-3 mr-1.5" /> Pause Node</>
                        ) : (
                          <><Play className="w-3 h-3 mr-1.5" /> Resume</>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteItem(item.id)}
                        className="text-text-muted hover:text-danger hover:bg-danger/10 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Persistence Infrastructure Pulse */}
      <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex gap-4 items-center">
        <Activity className="w-5 h-5 text-accent animate-pulse shrink-0" />
        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest flex-1">
          Persistence Relay: **Green** • Latency: **42ms** • Total Monitored Intelligence Points: **{(watchlists.length * 12).toLocaleString()}**
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:bg-accent/10 px-4 h-8" onClick={fetchWatchlists}>
            <Zap className="w-3 h-3 mr-1.5" /> Sync Relay
        </Button>
      </div>
    </div>
  );
}
