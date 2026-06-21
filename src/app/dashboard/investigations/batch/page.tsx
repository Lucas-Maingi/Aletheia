"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Play, CheckCircle2, AlertCircle, X, Shield, Layers, Database, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInvestigation } from "@/context/InvestigationContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function BatchInvestigationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [targets, setTargets] = useState<string[]>([]);
  const [results, setResults] = useState<{ id: string, target: string, status: string }[]>([]);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch('/api/user/usage');
        if (res.ok) {
          const data = await res.json();
          setPlan(data.plan || 'free');
        } else {
          setPlan('free');
        }
      } catch (err) {
        console.error("Failed to fetch plan:", err);
        setPlan('free');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Simulate parsing
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    // In a real app, use PapaParse or similar
    // For demo, we just simulate extracting 10-20 targets
    const mockTargets = [
      "suspect_01@protonmail.com",
      "alpha_node_77",
      "target_recon_delta@gmail.com",
      "ghost_protocol_9",
      "security_breach_test@outlook.com",
      "vanguard_intel_01",
      "shadow_broker_mirror",
      "nexus_analyst_beta"
    ];
    setTargets(mockTargets);
  };

  const startBatch = async () => {
    if (targets.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const newResults = targets.map(t => ({ id: Math.random().toString(36).substr(2, 9), target: t, status: 'pending' }));
    setResults(newResults);

    // Simulate batch processing sequence
    for (let i = 0; i < targets.length; i++) {
        // Update current item to 'scanning'
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'scanning' } : r));
        
        // Wait bit
        await new Promise(r => setTimeout(r, 1500));
        
        // Finalize
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'complete' } : r));
        setProgress(((i + 1) / targets.length) * 100);
    }

    setIsProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 animate-pulse">
          <Layers className="w-12 h-12 mb-4 text-accent animate-pulse" />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Authenticating Node Access...</p>
      </div>
    );
  }

  if (!loading && plan !== 'elite' && plan !== 'enterprise') {
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
              <Layers className="w-12 h-12 text-accent relative z-10 animate-pulse" />
            </div>

            {/* Copy Block */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Badge variant="outline" className="px-4 py-1.5 border-accent/30 bg-accent/10 text-accent uppercase font-black tracking-widest text-[9px]">
                <Zap className="w-3 h-3 mr-1.5 fill-accent animate-pulse" /> Premium Operations Feature
              </Badge>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-white uppercase tracking-tight italic">
                Unlock Massively <br />
                <span className="text-accent">Parallel Batch Intel</span>
              </h1>
              <p className="text-text-muted text-sm md:text-base leading-relaxed font-sans max-w-xl">
                Ingest CSV, TXT, or JSON target logs to execute thousands of OSINT connectors concurrently. Ideal for bulk audit logs, incident response list sweeps, and automated multi-vector synthesis reports.
              </p>
              
              {/* Feature Check Grid */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2 text-[11px] font-mono uppercase tracking-wider text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Parallel Scanning Nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Bulk CSV/JSON Import</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Clustered Report Synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>Webhook & API Auto-Export</span>
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                <Layers className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Batch Intelligence Console</h1>
        </div>
        <p className="text-text-muted text-sm max-w-2xl font-sans">
          Deploy massively parallel reconnaissance across multiple target vectors. Ingested data is automatically clustered and ranked by risk probability.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-surface/50 border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <CardContent className="p-8 flex flex-col items-center text-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv,.json,.txt"
                onChange={handleFileChange} 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all group/box"
              >
                <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover/box:scale-110 group-hover/box:bg-accent/20 group-hover/box:text-accent transition-all">
                    {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                <div>
                    <span className="block text-sm font-bold text-white mb-1">{file ? file.name : "Select Target Manifest"}</span>
                    <span className="block text-[10px] text-text-muted uppercase tracking-widest">CSV • JSON • TXT</span>
                </div>
              </div>

              {targets.length > 0 && (
                <div className="mt-8 w-full space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-text-muted uppercase">Ingested Leads</span>
                        <span className="text-accent font-bold">{targets.length} Targets</span>
                    </div>
                    <Button 
                        onClick={startBatch} 
                        disabled={isProcessing}
                        className="w-full bg-accent text-slate-900 font-bold hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                    >
                        {isProcessing ? <Zap className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        Initialize Bulk Sweep
                    </Button>
                    {file && (
                        <button onClick={() => { setFile(null); setTargets([]); setResults([]); }} className="text-[10px] text-danger/60 hover:text-danger uppercase font-bold tracking-widest transition-colors">
                            Clear Manifest
                        </button>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
                <Shield className="w-4 h-4 text-accent" />
                Elite Agency Protocol
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed font-sans">
                Batch mode utilizes the high-throughput **Recursive Engine Clusters**. All discoveries are automatically cross-checked against the global identity mesh.
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-surface/30 border-white/5 min-h-[500px] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-accent/50" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Execution Queue</span>
                    </div>
                    {isProcessing && (
                        <span className="text-[10px] font-mono text-accent animate-pulse">Processing Parallel Nodes...</span>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-0">
                    {results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                            <Target className="w-12 h-12 mb-4" />
                            <p className="text-sm font-mono uppercase tracking-[0.2em]">Queue Inactive</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {results.map((res, i) => (
                                <motion.div 
                                    key={res.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg border transition-colors ${
                                            res.status === 'complete' ? 'bg-success/10 border-success/20 text-success' :
                                            res.status === 'scanning' ? 'bg-accent/10 border-accent/20 text-accent animate-pulse' :
                                            'bg-white/5 border-white/10 text-white/30'
                                        }`}>
                                            {res.status === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : 
                                             res.status === 'scanning' ? <Zap className="w-4 h-4" /> : 
                                             <FileText className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{res.target}</div>
                                            <div className="text-[10px] text-text-muted font-mono uppercase tracking-tighter">
                                                {res.status === 'complete' ? 'Scan Optimized' : 
                                                 res.status === 'scanning' ? 'Decrypting Nodes...' : 'Queue Awaiting'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {res.status === 'complete' && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/10"
                                            onClick={() => router.push(`/dashboard/investigations/${res.id}`)}
                                        >
                                            View Dossier
                                        </Button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {isProcessing && (
                    <div className="p-6 bg-accent/5 border-t border-accent/20">
                        <div className="flex justify-between items-center text-[10px] font-mono text-accent mb-2 uppercase font-bold">
                            <span>Global Task Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-accent/10" indicatorClassName="bg-accent" />
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}
