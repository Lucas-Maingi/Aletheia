"use client";

import { motion } from "framer-motion";
import { Shield, ExternalLink, User, Calendar, Info, CheckCircle2, AlertTriangle, XCircle, ChevronDown } from "lucide-react";
import { FacialMatch } from "@/connectors/visualIntel";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface VitalityAudit {
  verdict: "Real" | "Synthetic" | "Suspicious";
  confidence: number;
  markers: string[];
}

export function FacialAnalysis({ 
  matches, 
  isScanning, 
  audit 
}: { 
  matches: FacialMatch[], 
  isScanning: boolean,
  audit?: VitalityAudit | null
}) {
  const [showMarkers, setShowMarkers] = useState(false);

  if (!isScanning && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-2xl border border-white/5 border-dashed">
        <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4">
          <Shield className="w-8 h-8 text-text-primary/10" />
        </div>
        <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-[0.2em]">No Biometric Matches Identified</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Global Vitality Audit Header */}
      {audit && (
        <div className="p-6 bg-surface-elevated border-border/20 shadow-xl relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
            audit.verdict === 'Real' ? 'from-success to-emerald-500' : 
            audit.verdict === 'Synthetic' ? 'from-destructive to-red-500' : 'from-warning to-orange-500'
          }`} />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xl ${
                audit.verdict === 'Real' ? 'bg-success/10 border-success/30 text-success' : 
                audit.verdict === 'Synthetic' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-warning/10 border-warning/30 text-warning'
              }`}>
                {audit.verdict === 'Real' ? <CheckCircle2 className="w-7 h-7" /> : 
                 audit.verdict === 'Synthetic' ? <XCircle className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-black tracking-tight text-text-primary/90">Identity_Vitality_Audit</h3>
                  <Badge variant="outline" className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md ${
                    audit.verdict === 'Real' ? 'bg-success/20 text-success border-success/30' : 
                    audit.verdict === 'Synthetic' ? 'bg-destructive/20 text-destructive border-destructive/30' : 'bg-warning/20 text-warning border-warning/30'
                  }`}>
                    {audit.verdict}
                  </Badge>
                </div>
                <p className="text-[11px] font-mono text-text-primary/40 leading-relaxed max-w-xl italic">
                  Visual material analyzed for GAN artifacts, diffusion markers, and identity inconsistencies. Analysis yield: {(audit.confidence * 100).toFixed(0)}% stability.
                </p>
              </div>
            </div>
            
            {audit.markers.length > 0 && (
              <button 
                onClick={() => setShowMarkers(!showMarkers)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-mono font-black uppercase tracking-widest hover:bg-white/[0.06] transition-all group/btn"
              >
                Inspect_Markers
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showMarkers ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {showMarkers && audit.markers.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {audit.markers.map((marker, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/40 shadow-[0_0_8px_#00f0ff]" />
                  <span className="text-[10px] font-mono text-text-primary/60 uppercase tracking-tighter">{marker}</span>
                </div>
              ))}
            </motion.div>
          )}

          <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none" />
        </div>
      )}

      {/* Facial Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-slate-950/20 border border-white/5 rounded-2xl overflow-hidden hover:border-accent/40 transition-all shadow-2xl hover:shadow-accent/5 backdrop-blur-sm"
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getConfidenceColor(match.confidence)}`} />

            <div className="p-5">
              <div className="flex items-start justify-between mb-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-900 flex items-center justify-center">
                    {match.thumbnailBase64 ? (
                      <img src={match.thumbnailBase64} alt="Facial Match Thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <User className="w-8 h-8 text-text-tertiary/20" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-accent text-text-secondary border border-white/20 shadow-xl">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-black font-mono tracking-tighter ${match.confidence > 0.9 ? 'text-accent' : match.confidence > 0.7 ? 'text-warning' : 'text-text-tertiary'}`}>
                    {(match.confidence * 100).toFixed(0)}<span className="text-[10px] ml-0.5">%</span>
                  </div>
                  <div className="text-[9px] text-text-primary/20 uppercase tracking-[0.1em] font-black">Bio_Match</div>
                </div>
              </div>

              <div className="mb-5">
                <div className="text-sm font-black text-text-primary/90 mb-1 truncate tracking-tight">{match.platform}</div>
                <div className="flex items-center gap-2 text-[10px] text-text-primary/30 font-mono tracking-tighter">
                  <Calendar className="w-3 h-3" />
                  ARCHIVE_PULSE: {new Date(match.timestamp).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-[9px] font-mono font-black uppercase tracking-[0.2em]">
                  <span className="text-text-primary/20">Mesh_Stability</span>
                  <span className={match.confidence > 0.9 ? 'text-accent' : 'text-text-primary/40'}>{match.confidence > 0.9 ? 'EXTREME' : 'ELEVATED'}</span>
                </div>
                <Progress value={match.confidence * 100} className="h-1 bg-white/5" indicatorClassName={getConfidenceBg(match.confidence)} />
              </div>

              <a 
                href={match.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-mono font-black uppercase tracking-widest text-text-primary/60 hover:bg-white/[0.08] hover:text-text-primary transition-all group/btn"
              >
                Access_Node <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>
        ))}
        
        {isScanning && (
          <div className="bg-slate-950/20 border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 min-h-[300px]">
             <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-accent/40 animate-pulse" />
             </div>
            <p className="text-[10px] text-accent/60 font-mono font-black uppercase tracking-[0.3em] text-center max-w-[140px] leading-relaxed">Recalibrating Biometric Mesh...</p>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-5 items-start">
        <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
            <Info className="w-5 h-5 text-accent shrink-0" />
        </div>
        <div className="text-[11px] text-text-primary/40 leading-relaxed font-mono">
          <span className="text-accent font-black uppercase tracking-[0.2em] block mb-1">Analyst_Protocol_v4.2</span>
          Visual intelligence is derived from cross-referencing public archival images, social metadata, and leaked biometrics. Identity integrity scores are probabilistic. Cross-verify with technical signatures for definitive attribution.
        </div>
      </div>
    </div>
  );
}

function getConfidenceColor(conf: number) {
  if (conf > 0.9) return "from-accent to-blue-500";
  if (conf > 0.7) return "from-warning to-orange-500";
  return "from-slate-500 to-slate-700";
}

function getConfidenceBg(conf: number) {
  if (conf > 0.9) return "bg-accent";
  if (conf > 0.7) return "bg-warning";
  return "bg-slate-500";
}
