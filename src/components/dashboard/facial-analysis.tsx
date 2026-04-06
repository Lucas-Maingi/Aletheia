"use client";

import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";
import { Shield, ExternalLink, User, CheckCircle2, AlertTriangle, XCircle, Zap, Search, Globe, MapPin, Info, ChevronDown } from "lucide-react";
import { FacialMatch } from "@/connectors/visualIntel";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useInvestigation } from "@/context/InvestigationContext";

interface VitalityAudit {
  verdict: "Real" | "Synthetic" | "Suspicious";
  confidence: number;
  markers: string[];
}

interface Props {
  matches: FacialMatch[];
  isScanning: boolean;
  audit?: VitalityAudit | null;
  exifData?: any[];
  subjectImageUrl?: string | null;
}

// Platforms that orbit the central hub during a scan
const ORBIT_PLATFORMS = [
  { label: "Yandex",   color: "#FF0000", icon: "Y",  angle: 0   },
  { label: "Google",   color: "#4285F4", icon: "G",  angle: 45  },
  { label: "TinEye",   color: "#E87722", icon: "T",  angle: 90  },
  { label: "Bing",     color: "#00809D", icon: "B",  angle: 135 },
  { label: "FaceCheck",color: "#9B59B6", icon: "FC", angle: 180 },
  { label: "Twitter",  color: "#1DA1F2", icon: "𝕏",  angle: 225 },
  { label: "LinkedIn", color: "#0A66C2", icon: "in", angle: 270 },
  { label: "TikTok",   color: "#FF0050", icon: "TT", angle: 315 },
];

/** Rotating scanline ring that sweeps across the face */
function ScanRing({ active }: { active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
      initial={false}
    >
      {/* Outer pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
        animate={active ? { scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] } : { opacity: 0.15 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Rotating sweep gradient */}
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 270deg, rgba(0,240,255,0.3) 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      )}
      {/* Inner glow */}
      <motion.div
        className="absolute inset-2 rounded-full border border-cyan-400/20"
        animate={active ? { opacity: [0.2, 0.6, 0.2] } : { opacity: 0.1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </motion.div>
  );
}

/** Biometric mesh: dots + lines overlaid on the face */
function BiometricMesh({ active }: { active: boolean }) {
  if (!active) return null;
  // Key biometric landmark positions (relative %)
  const landmarks = [
    { x: 50, y: 28 }, // forehead
    { x: 35, y: 42 }, // left eye
    { x: 65, y: 42 }, // right eye
    { x: 50, y: 52 }, // nose
    { x: 38, y: 62 }, // left mouth corner
    { x: 62, y: 62 }, // right mouth corner
    { x: 50, y: 70 }, // chin top
    { x: 50, y: 82 }, // chin
    { x: 25, y: 50 }, // left cheek
    { x: 75, y: 50 }, // right cheek
  ];
  const lines = [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5],
    [4, 6], [5, 6], [6, 7], [1, 8], [2, 9],
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection lines */}
        {lines.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={landmarks[a].x} y1={landmarks[a].y}
            x2={landmarks[b].x} y2={landmarks[b].y}
            stroke="rgba(0,240,255,0.35)"
            strokeWidth="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0.2] }}
            transition={{ duration: 1.5, delay: i * 0.07, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
        {/* Landmark dots */}
        {landmarks.map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.x} cy={pt.y} r="1.2"
            fill="rgba(0,240,255,0.8)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.5] }}
            transition={{ duration: 0.6, delay: i * 0.08, repeat: Infinity, repeatDelay: 2.5 }}
          />
        ))}
      </svg>
    </div>
  );
}

/** Single orbiting platform icon */
function OrbitIcon({ label, color, icon, angle, active }: {
  label: string; color: string; icon: string; angle: number; active: boolean;
}) {
  const RADIUS = 110; // px from centre
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * RADIUS;
  const y = Math.sin(rad) * RADIUS;

  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
      animate={active ? {
        x: [0, x * 0.2, x],
        y: [0, y * 0.2, y],
        opacity: [0, 0.4, 1],
        scale: [0.5, 0.8, 1],
      } : { x: 0, y: 0, opacity: 0, scale: 0 }}
      transition={{ duration: 0.6, delay: angle / 800, ease: "backOut" }}
    >
      <motion.div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border shadow-lg backdrop-blur-sm"
        style={{
          backgroundColor: `${color}22`,
          borderColor: `${color}55`,
          color,
          boxShadow: active ? `0 0 12px ${color}44` : "none",
        }}
        animate={active ? { boxShadow: [`0 0 6px ${color}22`, `0 0 18px ${color}55`, `0 0 6px ${color}22`] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        title={label}
      >
        {icon}
      </motion.div>
    </motion.div>
  );
}

/** Central biometric hub — the main focal point */
function BiometricHub({ imageUrl, isScanning, matchCount }: {
  imageUrl?: string | null;
  isScanning: boolean;
  matchCount: number;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 select-none">
      {/* Orbit container */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        {/* Orbiting platform icons */}
        {ORBIT_PLATFORMS.map(p => (
          <OrbitIcon key={p.label} {...p} active={isScanning} />
        ))}

        {/* Outer decorative rings */}
        <motion.div
          className="absolute rounded-full border border-white/5"
          style={{ width: 240, height: 240 }}
          animate={isScanning ? { rotate: 360 } : {}}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full border border-cyan-400/10"
          style={{ width: 200, height: 200 }}
          animate={isScanning ? { rotate: -360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Central face circle */}
        <div className="relative w-36 h-36 rounded-full z-10">
          <ScanRing active={isScanning} />

          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 bg-slate-900 relative">
            {imageUrl && !imageUrl.startsWith('data:') ? (
              <img src={imageUrl} alt="Subject" className="w-full h-full object-cover" />
            ) : imageUrl && imageUrl.startsWith('data:') ? (
              <img src={imageUrl} alt="Subject" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-white/10" />
              </div>
            )}
            <BiometricMesh active={isScanning} />
          </div>

          {/* Match count badge */}
          {matchCount > 0 && !isScanning && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-cyan-400/40 whitespace-nowrap"
            >
              {matchCount} MATCH{matchCount !== 1 ? "ES" : ""}
            </motion.div>
          )}
        </div>
      </div>

      {/* Status label */}
      <div className="text-center space-y-1">
        {isScanning ? (
          <motion.p
            className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-cyan-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ◉ BIOMETRIC SWEEP ACTIVE
          </motion.p>
        ) : matchCount > 0 ? (
          <p className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-emerald-400">
            ◉ SWEEP COMPLETE — {matchCount} LEADS ISOLATED
          </p>
        ) : (
          <p className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-white/30">
            ○ AWAITING TARGET DATA
          </p>
        )}
        <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
          {isScanning ? "Cross-referencing 8 intelligence engines..." : "Aletheia Visual Intelligence v3"}
        </p>
      </div>
    </div>
  );
}

/** Sherlock-style result card */
function MatchCard({ match, index }: { match: FacialMatch; index: number }) {
  const pct = Math.round((match.confidence ?? match.score / 100 ?? 0.85) * 100);
  const isHigh = pct >= 90;
  const isMed = pct >= 70 && pct < 90;

  const color = isHigh ? "#00f0ff" : isMed ? "#f59e0b" : "#6b7280";
  const glow = isHigh ? "shadow-cyan-400/20" : isMed ? "shadow-amber-400/20" : "";

  const host = (() => {
    try { return new URL(match.url).hostname.replace('www.', ''); } catch { return match.platform; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, ease: "backOut", duration: 0.5 }}
      className={`group relative rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${glow} ${
        match.isVerified ? 'border-cyan-400/25 bg-cyan-950/20' : 'border-white/8 bg-white/[0.02]'
      }`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          {/* Platform / Thumbnail */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/10 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
              {match.thumbnailBase64 ? (
                <img src={match.thumbnailBase64} className="w-full h-full object-cover" alt="" />
              ) : (
                <Globe className="w-4 h-4 text-white/20" />
              )}
            </div>
            <div>
              <div className="text-[11px] font-black text-white/80 truncate max-w-[120px]">{match.platform}</div>
              <div className="text-[9px] font-mono text-white/30 truncate max-w-[120px]">{host}</div>
            </div>
          </div>

          {/* Match percentage */}
          <div className="text-right">
            <div className="font-black font-mono text-3xl leading-none" style={{ color }}>
              {pct}<span className="text-sm ml-0.5">%</span>
            </div>
            <div className="text-[8px] uppercase tracking-widest font-black mt-0.5" style={{ color: `${color}99` }}>
              MATCH
            </div>
          </div>
        </div>

        {/* Entity name if identified */}
        {(match.extractedIdentity || match.metadata?.identifiedEntity || match.metadata?.entity) && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">
              {match.extractedIdentity || match.metadata?.identifiedEntity || match.metadata?.entity}
            </span>
          </div>
        )}

        {/* Match bar */}
        <div className="mb-4">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: index * 0.07 + 0.3, ease: "easeOut" }}
              style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-mono text-white/20 uppercase">Signal strength</span>
            <span className="text-[8px] font-mono uppercase" style={{ color: `${color}99` }}>
              {isHigh ? "EXTREME" : isMed ? "ELEVATED" : "MODERATE"}
            </span>
          </div>
        </div>

        {/* Source description snippet */}
        {match.metadata?.description && (
          <p className="text-[10px] text-white/40 font-mono leading-relaxed line-clamp-2 mb-4">
            {match.metadata.description}
          </p>
        )}

        {/* CTA */}
        <a
          href={match.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group/btn"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover/btn:text-white/70 transition-colors font-mono">
            Inspect Source
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover/btn:text-white/70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
        </a>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function FacialAnalysis({ matches, isScanning, audit, exifData = [], subjectImageUrl }: Props) {
  const [showMarkers, setShowMarkers] = useState(false);
  const { forceVisualScrape } = useInvestigation();

  const hasData = matches.length > 0 || exifData.length > 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* ── BIOMETRIC HUB ── */}
      <div className="relative rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-2xl overflow-hidden p-6">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(0,240,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        <div className="relative z-10">
          <BiometricHub imageUrl={subjectImageUrl} isScanning={isScanning} matchCount={matches.length} />

          {/* Force scrape button */}
          {!isScanning && (
            <div className="flex justify-center mt-2">
              <button
                onClick={forceVisualScrape}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/40 hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/30 transition-all group"
              >
                <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
                Force Deep Scrape
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── VITALITY AUDIT ── */}
      <AnimatePresence>
        {audit && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
          >
            <div className={`h-0.5 w-full bg-gradient-to-r ${
              audit.verdict === 'Real' ? 'from-emerald-500 to-green-400' :
              audit.verdict === 'Synthetic' ? 'from-red-500 to-rose-400' : 'from-amber-500 to-orange-400'
            }`} />
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  audit.verdict === 'Real' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  audit.verdict === 'Synthetic' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {audit.verdict === 'Real' ? <CheckCircle2 className="w-6 h-6" /> :
                   audit.verdict === 'Synthetic' ? <XCircle className="w-6 h-6" /> :
                   <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-black uppercase tracking-widest text-white/80">Identity Vitality</span>
                    <Badge className={`text-[8px] font-black uppercase px-2 py-0 rounded-md ${
                      audit.verdict === 'Real' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      audit.verdict === 'Synthetic' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>{audit.verdict}</Badge>
                  </div>
                  <p className="text-[10px] text-white/30 font-mono">
                    Stability yield: {(audit.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              {audit.markers.length > 0 && (
                <button
                  onClick={() => setShowMarkers(!showMarkers)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/8 text-[9px] font-mono font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-all"
                >
                  Markers <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMarkers ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showMarkers && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 grid grid-cols-2 md:grid-cols-3 gap-2 border-t border-white/5 pt-4"
                >
                  {audit.markers.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 shadow-[0_0_6px_#00f0ff]" />
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-tight">{m}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULT CARDS ── */}
      {matches.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-white/20">
              {matches.length} Intelligence Lead{matches.length !== 1 ? 's' : ''} Isolated
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {matches.map((m, i) => <MatchCard key={i} match={m} index={i} />)}
          </div>
        </div>
      )}

      {/* ── EXIF / METADATA ── */}
      {exifData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white/40">
              Forensic Metadata
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exifData.map((exif, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 backdrop-blur-xl"
              >
                <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {exif.title}
                </div>
                <div className="prose prose-invert prose-xs max-w-none text-white/50 font-mono text-[10px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{exif.description}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!isScanning && !hasData && (
        <div className="text-center py-8 space-y-2">
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
            No visual intelligence recovered. Run a sweep to begin.
          </p>
        </div>
      )}

      {/* ── PROTOCOL FOOTER ── */}
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
        <div className="p-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 shrink-0">
          <Info className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-[10px] text-white/25 leading-relaxed font-mono">
          <span className="text-cyan-400/70 font-black uppercase tracking-[0.2em] block mb-1">Analyst Protocol</span>
          Visual intelligence is derived from cross-referencing public archival data and biometric index APIs.
          All confidence scores are probabilistic. Cross-verify with technical signatures for definitive attribution.
        </div>
      </div>
    </div>
  );
}
