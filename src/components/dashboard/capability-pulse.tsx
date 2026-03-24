"use client";

import { motion } from 'framer-motion';
import { 
  Shield, Zap, Globe, Fingerprint, Database, 
  Cpu, Lock, Activity, Search, Share2 
} from 'lucide-react';
import { CapabilityLayer } from '@/lib/osint/registry';

interface CapabilityNodeProps {
  layer: CapabilityLayer;
  status: 'active' | 'idle' | 'complete' | 'error';
  label: string;
}

const LAYER_ICONS: Record<CapabilityLayer, any> = {
  [CapabilityLayer.IDENTITY]: Fingerprint,
  [CapabilityLayer.INFRA]: Shield,
  [CapabilityLayer.PHONE]: Zap,
  [CapabilityLayer.GEO]: Globe,
  [CapabilityLayer.BUSINESS]: Database,
  [CapabilityLayer.SOCIAL]: Share2,
  [CapabilityLayer.IMAGE]: Cpu,
  [CapabilityLayer.THREAT]: Lock,
  [CapabilityLayer.SEARCH]: Search,
  [CapabilityLayer.GRAPH]: Activity,
};

export function CapabilityPulse({ activeLayers = [] }: { activeLayers?: CapabilityLayer[] }) {
  if (activeLayers.length === 0) return (
    <div className="h-12 flex items-center px-4 bg-surface/20 border border-border/10 rounded-xl">
      <span className="text-[10px] font-mono font-bold text-text-tertiary uppercase tracking-widest opacity-40 italic">Awaiting_Signal_Acquisition...</span>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2.5">
      {activeLayers.map((layer) => {
        const Icon = LAYER_ICONS[layer];
        
        return (
          <motion.div
            key={layer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-2 rounded-xl border bg-accent/5 border-accent/20 shadow-glow-cyan-sm flex items-center gap-2.5 group hover:bg-accent/10 transition-all duration-300"
          >
            <div className="p-1.5 rounded-lg bg-accent/20 text-accent group-hover:scale-110 transition-transform">
              <Icon className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-primary">
                {layer}
              </span>
              <span className="text-[7px] font-bold uppercase tracking-tighter text-success opacity-80">
                Active_Node
              </span>
            </div>
          </motion.div>
        );
      })}
      
      <div className="px-3 py-2 rounded-xl border border-dashed border-border/10 flex items-center gap-2 opacity-30">
        <Activity className="w-3.5 h-3.5" />
        <span className="text-[9px] font-black uppercase tracking-widest">More_Pending</span>
      </div>
    </div>
  );
}
