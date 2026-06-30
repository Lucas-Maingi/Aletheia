'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Globe,
  Mail,
  User,
  Clock,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Terminal,
  Database,
  MapPin,
  Hash,
  Activity,
  Video,
  Play,
  RotateCcw,
  EyeOff,
  Sparkles,
  Network,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DEMO_PERSON, DEMO_DOMAIN, CONNECTOR_DISPLAY_NAMES } from '@/lib/demo-data';
import { IdentityGraph } from '@/components/dashboard/identity-graph';

// ─── TYPES ──────────────────────────────────────────────────────
type DemoData = typeof DEMO_PERSON | typeof DEMO_DOMAIN;

interface EvidenceItem {
  id: string;
  title: string;
  content: string;
  connector: string;
  platform: string;
  category: string;
  tags?: string[];
  confidenceScore: number;
  confidenceLabel: 'VERIFIED' | 'HIGH' | 'MEDIUM' | 'LOW';
  sourceUrl?: string;
  timestamp: string;
}

interface EntityItem {
  type: string;
  value: string;
  source: string;
  notes?: string;
  confidence: number;
  tags?: string[];
  confidenceScore?: number;
  name?: string;
}

type TimelineEntry = typeof DEMO_PERSON['timeline'][number];

// ─── CONSTANTS ──────────────────────────────────────────────────

const CONFIDENCE_COLORS: Record<string, string> = {
  VERIFIED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  HIGH: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  LOW: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const TIMELINE_COLORS: Record<string, string> = {
  system: 'bg-zinc-500',
  social: 'bg-purple-500',
  professional: 'bg-purple-500',
  breach: 'bg-red-500',
  infrastructure: 'bg-blue-500',
  geolocation: 'bg-blue-500',
  exposure: 'bg-amber-500',
  registration: 'bg-cyan-500',
  alert: 'bg-amber-500',
  ai: 'bg-accent',
  complete: 'bg-emerald-500',
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-3 h-3" />,
  username: <User className="w-3 h-3" />,
  domain: <Globe className="w-3 h-3" />,
  ip: <Hash className="w-3 h-3" />,
  phone: <Terminal className="w-3 h-3" />,
  name: <User className="w-3 h-3" />,
  location: <MapPin className="w-3 h-3" />,
};

// ─── ANIMATION VARIANTS ─────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ─── SIMPLE MARKDOWN RENDERER ───────────────────────────────────

function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-border my-6" />')
    // H4
    .replace(
      /^#### (.+)$/gm,
      '<h4 class="text-base font-semibold text-text-primary mt-6 mb-3">$1</h4>'
    )
    // H3
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-lg font-bold text-text-primary mt-8 mb-4">$1</h3>'
    )
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>')
    // Ordered list items
    .replace(
      /^(\d+)\. (.+)$/gm,
      '<div class="flex gap-2 ml-4 mb-1.5"><span class="text-accent font-mono text-sm">$1.</span><span class="text-text-secondary text-sm">$2</span></div>'
    )
    // Unordered list items (- prefix)
    .replace(
      /^- (.+)$/gm,
      '<div class="flex gap-2 ml-4 mb-1.5"><span class="text-accent">•</span><span class="text-text-secondary text-sm">$1</span></div>'
    )
    // Newlines
    .replace(/\n/g, '<br />');

  // Process tables: find table blocks and convert them
  // Match table blocks: rows of | col | col | separated by <br />
  html = html.replace(
    /(\|[^<]+\|<br \/>)(\|[-| :]+\|<br \/>)((?:\|[^<]+\|(?:<br \/>)?)+)/g,
    (_match, headerRow, _separator, bodyRows) => {
      const parseRow = (row: string) =>
        row
          .split('|')
          .filter((c: string) => c.trim() !== '')
          .map((c: string) => c.trim());

      const headers = parseRow(headerRow.replace('<br />', ''));
      const rows = bodyRows
        .split('<br />')
        .filter((r: string) => r.trim() && r.includes('|'))
        .map((r: string) => parseRow(r));

      let table =
        '<div class="overflow-x-auto my-4 rounded-lg border border-border"><table class="w-full text-sm"><thead><tr class="bg-surface-elevated">';
      headers.forEach((h: string) => {
        table += `<th class="px-4 py-2.5 text-left text-xs uppercase tracking-wider text-text-secondary font-medium">${h}</th>`;
      });
      table += '</tr></thead><tbody>';
      rows.forEach((row: string[], i: number) => {
        table += `<tr class="${i % 2 === 0 ? 'bg-surface/50' : 'bg-surface-elevated/30'}">`;
        row.forEach((cell: string) => {
          table += `<td class="px-4 py-2 text-text-secondary border-t border-border/50">${cell}</td>`;
        });
        table += '</tr>';
      });
      table += '</tbody></table></div>';
      return table;
    }
  );

  return html;
}

// ─── SUBCOMPONENTS ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  index,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      className="relative group rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-2 overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-accent scale-75">{icon}</span>
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-medium truncate">
            {label}
          </span>
        </div>
        <p className="text-lg font-black text-text-primary leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const [expanded, setExpanded] = useState(false);
  const connector = CONNECTOR_DISPLAY_NAMES[item.connector];
  const ts = new Date(item.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="relative group rounded-xl border border-border bg-surface/80 backdrop-blur-sm overflow-hidden hover:border-border-hover transition-colors duration-200"
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${
          item.confidenceLabel === 'VERIFIED'
            ? 'from-emerald-500/60 via-emerald-400/30 to-transparent'
            : item.confidenceLabel === 'HIGH'
            ? 'from-blue-500/60 via-blue-400/30 to-transparent'
            : item.confidenceLabel === 'MEDIUM'
            ? 'from-amber-500/60 via-amber-400/30 to-transparent'
            : 'from-red-500/60 via-red-400/30 to-transparent'
        }`}
      />

      <div className="p-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {connector && (
              <span className="text-sm shrink-0" title={connector.name}>
                {connector.icon}
              </span>
            )}
            <h4 className="text-[10px] font-semibold text-text-primary truncate">{item.title}</h4>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
              CONFIDENCE_COLORS[item.confidenceLabel]
            }`}
          >
            {item.confidenceLabel === 'VERIFIED' && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
            {item.confidenceLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {(item.tags || []).map((tag, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[8px] uppercase tracking-wider text-text-tertiary bg-surface/50 px-1 py-0 border-border/50"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Content Snippet */}
        <div className="relative mb-1.5">
          <p
            className={`text-[9px] text-text-secondary leading-relaxed font-mono ${
              !expanded && 'line-clamp-2'
            }`}
          >
            {item.content}
          </p>
          {!expanded && item.content.length > 100 && (
            <div className="absolute bottom-0 right-0 bg-gradient-to-l from-surface/80 to-transparent pl-4 pb-0">
              <button
                onClick={() => setExpanded(true)}
                className="text-[9px] text-accent hover:text-accent-hover font-bold flex items-center gap-1"
              >
                Expand <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {item.content.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] text-accent hover:text-accent-hover flex items-center gap-1 mb-1.5 transition-colors"
          >
            <ChevronDown
              className={`w-2.5 h-2.5 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-medium px-1.5 py-0.5 rounded bg-surface-elevated">
              {item.platform}
            </span>
            <span className="text-[9px] text-text-tertiary font-mono">{ts}</span>
          </div>
          {item.sourceUrl && item.sourceUrl !== '#' && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-tertiary hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineItem({ entry, index }: { entry: TimelineEntry; index: number }) {
  const dotColor = TIMELINE_COLORS[entry.type] || 'bg-zinc-500';

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      className="relative flex gap-4 pb-6 last:pb-0"
    >
      {/* Vertical line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${dotColor} shrink-0 ring-4 ring-background z-10`} />
        <div className="w-px flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className="pb-2 -mt-0.5">
        <span className="font-mono text-xs text-text-tertiary">{entry.time}</span>
        <p className="text-sm text-text-secondary mt-0.5">{entry.event}</p>
      </div>
    </motion.div>
  );
}

function EntityChip({ entity }: { entity: EntityItem }) {
  const icon = ENTITY_ICONS[entity.type] || <Hash className="w-3 h-3" />;
  const confidenceColor =
    entity.confidence >= 90
      ? 'text-emerald-400'
      : entity.confidence >= 70
      ? 'text-blue-400'
      : entity.confidence >= 50
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <motion.div
      variants={itemVariants}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface/80 backdrop-blur-sm hover:border-border-hover transition-colors"
    >
      <span className="text-accent">{icon}</span>
      <span className="text-sm text-text-primary font-medium truncate max-w-[200px]">
        {entity.value}
      </span>
      <span className={`text-xs font-mono font-semibold ${confidenceColor}`}>
        {entity.confidence}%
      </span>
      <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
        {entity.source}
      </span>
    </motion.div>
  );
}

// ─── INVESTIGATION PANEL (per tab) ──────────────────────────────

function InvestigationPanel({ data }: { data: DemoData }) {
  const [view, setView] = useState<'evidence' | 'timeline' | 'graph' | 'dossier' | 'entities'>('evidence');

  const stats = data.stats;
  const dossierHtml = useMemo(() => renderMarkdown(data.dossier), [data.dossier]);

  return (
    <div className="space-y-8">
      {/* ── Investigation Header ── */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            {data.investigation.title}
          </h2>
          <Badge variant="success" size="sm" className="w-fit flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent" />
            Scan Duration: <strong className="text-text-primary">{data.investigation.scanDuration}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-accent" />
            Entities Found: <strong className="text-text-primary">{stats.entitiesFound}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" />
            Evidence Items: <strong className="text-text-primary">{stats.evidenceCount}</strong>
          </span>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          index={0}
          label="Connectors Run"
          value={`${stats.connectorsSucceeded}/${stats.connectorsRun}`}
          icon={<Zap className="w-4 h-4" />}
        />
        <StatCard
          index={1}
          label="Evidence Collected"
          value={stats.evidenceCount}
          icon={<Search className="w-4 h-4" />}
        />
        <StatCard
          index={2}
          label="Entities Found"
          value={stats.entitiesFound}
          icon={<Database className="w-4 h-4" />}
        />
        <StatCard
          index={3}
          label="Avg Confidence"
          value={`${Math.round(stats.confidenceAvg * 100)}%`}
          icon={<Shield className="w-4 h-4" />}
        />
      </motion.div>

      {/* ── Content Switcher ── */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: 'evidence', label: 'Evidence', icon: <Search className="w-3.5 h-3.5" /> },
            { key: 'timeline', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
            { key: 'graph', label: 'Network Graph', icon: <Network className="w-3.5 h-3.5" /> },
            { key: 'dossier', label: 'Dossier', icon: <Terminal className="w-3.5 h-3.5" /> },
            { key: 'entities', label: 'Entities', icon: <Database className="w-3.5 h-3.5" /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              view === tab.key
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.key === 'evidence' && (
              <span className="text-[10px] font-mono ml-1 opacity-60">{data.evidence.length}</span>
            )}
            {tab.key === 'entities' && (
              <span className="text-[10px] font-mono ml-1 opacity-60">{data.entities.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content Panels ── */}
      <AnimatePresence mode="wait">
        {/* Evidence Grid */}
        {view === 'evidence' && (
          <motion.div
            key="evidence"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {data.evidence.map((item) => (
              <EvidenceCard key={item.id} item={item} />
            ))}
          </motion.div>
        )}

        {/* Timeline */}
        {view === 'timeline' && (
          <motion.div
            key="timeline"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="max-w-2xl rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-6"
          >
            <h3 className="text-sm uppercase tracking-widest text-text-secondary font-medium mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Scan Timeline
            </h3>
            {data.timeline.map((entry, i) => (
              <TimelineItem key={i} entry={entry} index={i} />
            ))}
          </motion.div>
        )}

        {/* Network Graph */}
        {view === 'graph' && (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-surface/80 border border-border rounded-xl p-5 shadow-xl backdrop-blur-sm h-[600px] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <Network className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
                Interactive Identity Network Graph
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <IdentityGraph
                target={data.investigation.title}
                evidence={data.evidence}
                entities={data.entities}
              />
            </div>
          </motion.div>
        )}

        {/* Dossier */}
        {view === 'dossier' && (
          <motion.div
            key="dossier"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-8 prose-invert max-w-none"
          >
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
                AI-Generated Intelligence Dossier
              </span>
            </div>
            <div
              className="text-text-secondary leading-relaxed space-y-1"
              dangerouslySetInnerHTML={{ __html: dossierHtml }}
            />
          </motion.div>
        )}

        {/* Entities */}
        {view === 'entities' && (
          <motion.div
            key="entities"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
                Discovered Entities ({data.entities.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.entities.map((entity, i) => (
                <EntityChip key={i} entity={entity} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DemoPage() {
  const [isEmbed, setIsEmbed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const embed = params.get('embed') === 'true';
    setIsEmbed(embed);
  }, []);

  return (
    <div className={`min-h-screen bg-background pb-24 ${isEmbed ? 'p-0 bg-transparent min-h-0 pb-0' : ''}`}>
      {!isEmbed && (
        <div className="max-w-7xl mx-auto px-6 pt-12 text-center">
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight mb-2">Live Intelligence Demo</h1>
          <p className="text-sm text-text-secondary font-medium mb-8">Watch Aletheia run a real-time OSINT scan on a pre-seeded target persona</p>
        </div>
      )}
      <div className={`max-w-7xl mx-auto px-6 py-4 ${isEmbed ? 'p-0 max-w-none py-0' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <CinematicDemo autoStart={true} />
        </motion.div>
      </div>
    </div>
  );
}

// Simple loader helper
function Loader(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export function CinematicDemo({ autoStart = false }: { autoStart?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(autoStart);

  useEffect(() => {
    if (autoStart) {
      setIsPlaying(true);
    }
  }, [autoStart]);

  const [speed, setSpeed] = useState(1.2); // Speed multiplier
  const [currentStep, setCurrentStep] = useState(0); 
  const [typedTarget, setTypedTarget] = useState("");
  const [activeConnectors, setActiveConnectors] = useState<string[]>([]);
  const [finishedConnectors, setFinishedConnectors] = useState<string[]>([]);
  const [visibleEvidence, setVisibleEvidence] = useState<typeof DEMO_PERSON.evidence>([]);
  const [visibleEntities, setVisibleEntities] = useState<typeof DEMO_PERSON.entities>([]);
  const [visibleLogs, setVisibleLogs] = useState<typeof DEMO_PERSON.timeline>([]);
  const [showDossier, setShowDossier] = useState(false);
  const [dossierText, setDossierText] = useState("");
  const [view, setView] = useState<'evidence' | 'timeline' | 'graph' | 'dossier' | 'entities'>('timeline');

  const targetEmail = "timothy.gonzalez@example.com";
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dossierContainerRef = useRef<HTMLDivElement>(null);
  const logFeedRef = useRef<HTMLDivElement>(null);
  const evidenceContainerRef = useRef<HTMLDivElement>(null);

  // Auto-play control loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next === 1) {
          animateTyping(targetEmail);
          return next;
        }
        
        // Ingestion phase: next = 2 to 13
        if (next >= 2 && next <= 13) {
          const logIndex = next - 2; // 0 to 11
          
          // Add timeline log
          if (DEMO_PERSON.timeline[logIndex]) {
            setVisibleLogs((logs) => {
              if (logs.some(l => l.event === DEMO_PERSON.timeline[logIndex].event)) return logs;
              return [...logs, DEMO_PERSON.timeline[logIndex]];
            });
          }

          // Active connectors
          if (logIndex === 1) {
            setActiveConnectors(Object.keys(CONNECTOR_DISPLAY_NAMES));
          } else if (logIndex >= 2) {
            const connectorKeys = Object.keys(CONNECTOR_DISPLAY_NAMES);
            const finishedKey = connectorKeys[logIndex - 2];
            if (finishedKey) {
              setActiveConnectors((active) => active.filter((k) => k !== finishedKey));
              setFinishedConnectors((fin) => {
                if (fin.includes(finishedKey)) return fin;
                return [...fin, finishedKey];
              });
            }

            // Sync evidence count exactly with timeline progress
            let evidenceCount = 0;
            if (logIndex === 2) evidenceCount = 1;      // GitHub
            else if (logIndex === 3) evidenceCount = 2; // Reddit
            else if (logIndex === 4) evidenceCount = 3; // Twitter/X
            else if (logIndex === 5) evidenceCount = 4; // LinkedIn
            else if (logIndex === 6) evidenceCount = 7; // breaches (ev-005, ev-006, ev-007)
            else if (logIndex === 7) evidenceCount = 8; // domain
            else if (logIndex === 8) evidenceCount = 9; // ip
            else if (logIndex === 9) evidenceCount = 10; // Pastebin
            else if (logIndex >= 10) evidenceCount = 11; // Registration scout / all

            const evidenceSlice = DEMO_PERSON.evidence.slice(0, evidenceCount);
            setVisibleEvidence(evidenceSlice);

            // Sync entities count
            let entityCount = Math.min(DEMO_PERSON.entities.length, logIndex);
            if (logIndex >= 10) entityCount = DEMO_PERSON.entities.length;
            const entitiesSlice = DEMO_PERSON.entities.slice(0, entityCount);
            setVisibleEntities(entitiesSlice);
          }
          return next;
        }

        // Network graph view phase: next = 14 to 18
        if (next >= 14 && next <= 18) {
          // Finish all connectors
          setFinishedConnectors(Object.keys(CONNECTOR_DISPLAY_NAMES));
          setActiveConnectors([]);
          setVisibleEvidence(DEMO_PERSON.evidence);
          setVisibleEntities(DEMO_PERSON.entities);
          
          if (next === 14) {
            // Ingestion complete, starting AI synthesis
            setVisibleLogs((logs) => {
              if (logs.some(l => l.event === DEMO_PERSON.timeline[11].event)) return logs;
              return [...logs, DEMO_PERSON.timeline[11]];
            });
          }
          return next;
        }

        // Entities view phase: next = 19 to 20
        if (next === 19) {
          // Scan complete log
          setVisibleLogs((logs) => {
            if (logs.some(l => l.event === DEMO_PERSON.timeline[12].event)) return logs;
            return [...logs, DEMO_PERSON.timeline[12]];
          });
          return next;
        }
        if (next === 20) {
          return next;
        }

        // Dossier compilation phase: next = 21 to 22
        if (next === 21) {
          setShowDossier(true);
          animateDossier();
          return next;
        }

        if (next > 21) {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return 22;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Autotabbing controller based on scanning step progress
  useEffect(() => {
    if (currentStep === 1) {
      setView('timeline');
    } else if (currentStep >= 2 && currentStep <= 13) {
      setView('evidence');
    } else if (currentStep >= 14 && currentStep <= 18) {
      setView('graph');
    } else if (currentStep >= 19 && currentStep <= 20) {
      setView('entities');
    } else if (currentStep >= 21) {
      setView('dossier');
    }
  }, [currentStep]);

  // Auto-scroll dossier container to bottom as it compiles
  useEffect(() => {
    if (dossierContainerRef.current) {
      setTimeout(() => {
        if (dossierContainerRef.current) {
          dossierContainerRef.current.scrollTop = dossierContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [dossierText]);

  // Auto-scroll log feed container to bottom as it logs
  useEffect(() => {
    if (logFeedRef.current) {
      setTimeout(() => {
        if (logFeedRef.current) {
          logFeedRef.current.scrollTop = logFeedRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [visibleLogs]);

  // Auto-scroll evidence container to bottom as new evidence is collected
  useEffect(() => {
    if (evidenceContainerRef.current) {
      setTimeout(() => {
        if (evidenceContainerRef.current) {
          evidenceContainerRef.current.scrollTop = evidenceContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [visibleEvidence]);

  const animateTyping = (text: string) => {
    let index = 0;
    const typingTimer = setInterval(() => {
      setTypedTarget((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(typingTimer);
      }
    }, 50);
  };

  const animateDossier = () => {
    let index = 0;
    const fullText = DEMO_PERSON.dossier;
    const chunk = 15;
    const dossierTimer = setInterval(() => {
      setDossierText((prev) => prev + fullText.substring(index, index + chunk));
      index += chunk;
      if (index >= fullText.length) {
        clearInterval(dossierTimer);
      }
    }, 30);
  };

  const startSimulation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setTypedTarget("");
    setActiveConnectors([]);
    setFinishedConnectors([]);
    setVisibleEvidence([]);
    setVisibleEntities([]);
    setVisibleLogs([]);
    setShowDossier(false);
    setDossierText("");
    setView('timeline');
    setTimeout(() => setIsPlaying(true), 100);
  };

  const dossierHtml = useMemo(() => renderMarkdown(dossierText), [dossierText]);

  return (
    <div className="w-full h-full bg-surface/20 border border-border/10 rounded-2xl flex flex-col relative p-4 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none" />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col w-full min-h-0">
        {/* Stage 1: Terminal Input Prompt */}
        {currentStep === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 min-h-0">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl bg-surface/60 border border-border/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-border/10 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="ml-3 text-[10px] font-mono text-text-tertiary tracking-wider">ALETHEIA INTEL DIRECTORY SWEEP</span>
                </div>
                <Shield className="w-4 h-4 text-accent" />
              </div>

              <div className="space-y-4">
                <div className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Initiate footprint sweep for target:</div>
                <div className="flex items-center gap-3 p-4 bg-background/50 border border-border/10 rounded-xl">
                  <Terminal className="w-4 h-4 text-accent" />
                  <span className="font-mono text-accent text-sm font-bold">timothy.gonzalez@example.com</span>
                  <span className="w-1.5 h-4 bg-accent animate-pulse" />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={startSimulation}
                    className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-2 rounded-xl gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] uppercase text-[10px] tracking-widest"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Autoplay Scan
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stage 2: Active Investigation Board */}
        {currentStep > 0 && (
          <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
            {/* Real-time stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
              <StatCard
                index={0}
                label="Connectors Run"
                value={`${finishedConnectors.length}/12`}
                icon={<Zap className="w-4 h-4" />}
              />
              <StatCard
                index={1}
                label="Evidence Collected"
                value={visibleEvidence.length}
                icon={<Search className="w-4 h-4" />}
              />
              <StatCard
                index={2}
                label="Entities Found"
                value={visibleEntities.length}
                icon={<Database className="w-4 h-4" />}
              />
              <StatCard
                index={3}
                label="Avg Confidence"
                value={currentStep >= 2 ? "94%" : "0%"}
                icon={<Shield className="w-4 h-4" />}
              />
            </div>

            {/* Split layout: left column status, right column results */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-hidden">
              {/* Left Column: Live Scan Status & Activity Feed */}
              <div className="md:col-span-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                {/* Active scan status */}
                <div className="bg-surface/50 border border-border/10 rounded-xl p-3 shadow-xl backdrop-blur-sm shrink-0">
                  <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-3">Scanning Node</h3>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-bold truncate text-text-primary" title={DEMO_PERSON.investigation.title}>
                        {DEMO_PERSON.investigation.title}
                      </h2>
                      <p className="text-[10px] text-text-secondary truncate">Subject: timothy.gonzalez@example.com</p>
                    </div>
                    <div className="shrink-0">
                      {currentStep >= 18 ? (
                        <Badge variant="success" size="sm" className="gap-1.5 px-2.5 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          COMPLETE
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="gap-1.5 px-2.5 py-1 animate-pulse bg-accent/15 border-accent/20 text-accent">
                          <Loader className="w-3.5 h-3.5 animate-spin text-accent" />
                          SCANNING
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Connectors Matrix */}
                  <div className="border-t border-border/10 pt-4">
                    <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Connectors Ingestion ({finishedConnectors.length}/12)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(CONNECTOR_DISPLAY_NAMES).map(([key, value]) => {
                        const isActive = activeConnectors.includes(key);
                        const isFinished = finishedConnectors.includes(key);

                        return (
                          <div
                            key={key}
                            className={`p-2 rounded border text-center transition-all duration-300 ${
                              isFinished
                                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400"
                                : isActive
                                ? "bg-accent/10 border-accent/30 text-accent animate-pulse"
                                : "bg-foreground/[0.02] border-border/5 text-text-tertiary/40"
                            }`}
                          >
                            <div className="text-xs mb-1">{value.icon}</div>
                            <div className="text-[8px] truncate font-mono">{value.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live log feed box */}
                <div className="bg-surface/50 border border-border/10 rounded-xl p-3 shadow-xl backdrop-blur-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                  <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2 shrink-0">Live Log Feed</h3>
                  <div 
                    ref={logFeedRef}
                    className="flex-1 font-mono text-[10px] space-y-2.5 overflow-y-auto custom-scrollbar pr-1"
                  >
                    <AnimatePresence initial={false}>
                      {visibleLogs.map((log, index) => {
                        let typeColor = "text-text-tertiary";
                        if (log.type === "social" || log.type === "professional") typeColor = "text-purple-400";
                        if (log.type === "breach") typeColor = "text-red-400";
                        if (log.type === "infrastructure" || log.type === "geolocation") typeColor = "text-blue-400";
                        if (log.type === "ai") typeColor = "text-accent font-bold";
                        if (log.type === "complete") typeColor = "text-emerald-400 font-bold";

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-2 leading-relaxed"
                          >
                            <span className="text-text-tertiary/50">[{log.time}]</span>
                            <span className={`${typeColor}`}>{log.event}</span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right Column: Uniform Tab content */}
              <div className="md:col-span-2 flex flex-col gap-4 min-h-0 overflow-hidden">
                {/* Content Switcher */}
                <div className="flex flex-wrap gap-2 bg-foreground/[0.03] border border-border/10 p-1 rounded-xl w-fit shrink-0">
                  {(
                    [
                      { key: 'evidence', label: 'Evidence', icon: <Search className="w-3.5 h-3.5" /> },
                      { key: 'timeline', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
                      { key: 'graph', label: 'Network Graph', icon: <Network className="w-3.5 h-3.5" /> },
                      { key: 'dossier', label: 'Dossier', icon: <Terminal className="w-3.5 h-3.5" /> },
                      { key: 'entities', label: 'Entities', icon: <Database className="w-3.5 h-3.5" /> },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setView(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        view === tab.key
                          ? 'bg-accent/15 text-accent border border-accent/20'
                          : 'text-text-secondary hover:text-text-primary border border-transparent'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.key === 'evidence' && (
                        <span className="text-[10px] font-mono ml-1 opacity-60 bg-foreground/10 px-1.5 py-0.5 rounded">{visibleEvidence.length}</span>
                      )}
                      {tab.key === 'entities' && (
                        <span className="text-[10px] font-mono ml-1 opacity-60 bg-foreground/10 px-1.5 py-0.5 rounded">{visibleEntities.length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content panel */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {/* Evidence Tab */}
                    {view === 'evidence' && (
                      <motion.div
                        key="evidence"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-surface/50 border border-border/10 rounded-xl p-3 shadow-xl backdrop-blur-sm flex flex-col flex-1 min-h-0 overflow-hidden"
                      >
                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0" ref={evidenceContainerRef}>
                          <div className="grid grid-cols-1 gap-3">
                            {visibleEvidence.map((ev) => (
                              <EvidenceCard key={ev.id} item={ev} />
                            ))}
                          </div>
                        </div>
                        {visibleEvidence.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                            <Database className="w-8 h-8 mb-2 animate-pulse text-accent" />
                            <span className="text-xs font-mono uppercase tracking-wider">Awaiting evidence ingestion...</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Timeline Tab */}
                    {view === 'timeline' && (
                      <motion.div
                        key="timeline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-surface/50 border border-border/10 rounded-xl p-4 shadow-xl backdrop-blur-sm flex flex-col flex-1 min-h-0 overflow-hidden"
                      >
                        <h3 className="text-[10px] uppercase tracking-widest text-text-secondary font-medium mb-3 flex items-center gap-2 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          Scan Timeline
                        </h3>
                        <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
                          {visibleLogs.map((entry, i) => (
                            <TimelineItem key={i} entry={entry} index={i} />
                          ))}
                        </div>
                        {visibleLogs.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                            <Clock className="w-8 h-8 mb-2 animate-pulse text-accent" />
                            <span className="text-xs font-mono uppercase tracking-wider">Awaiting scan initiation...</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Network Graph Tab */}
                    {view === 'graph' && (
                      <motion.div
                        key="graph"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-surface/50 border border-border/10 rounded-xl p-4 shadow-xl backdrop-blur-sm flex flex-col flex-1 min-h-0 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mb-3 shrink-0">
                          <Network className="w-4 h-4 text-accent animate-pulse" />
                          <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
                            Interactive Identity Network Graph (Real-time Ingestion)
                          </span>
                        </div>
                        <div className="flex-1 min-h-0">
                          <IdentityGraph
                            target="timothy.gonzalez@example.com"
                            evidence={visibleEvidence}
                            entities={visibleEntities}
                          />
                        </div>
                        {visibleEvidence.length === 0 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-tertiary bg-surface/50 backdrop-blur-sm rounded-xl">
                            <Network className="w-8 h-8 mb-2 animate-pulse text-accent" />
                            <span className="text-xs font-mono uppercase tracking-wider">Constructing network nodes...</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Dossier Tab */}
                    {view === 'dossier' && (
                      <motion.div
                        key="dossier"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-surface/50 border border-border/10 rounded-xl p-4 shadow-xl backdrop-blur-sm flex flex-col flex-1 min-h-0 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border shrink-0">
                          <Terminal className="w-4 h-4 text-accent" />
                          <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
                            AI Executive Dossier Synthesis
                          </span>
                        </div>
                        
                        <div 
                          ref={dossierContainerRef}
                          className="text-text-secondary leading-relaxed space-y-1 flex-1 font-mono text-xs overflow-y-auto pr-2 custom-scrollbar"
                        >
                          {dossierText ? (
                            <div dangerouslySetInnerHTML={{ __html: dossierHtml }} />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                              <Sparkles className="w-8 h-8 mb-2 animate-pulse text-accent" />
                              <span className="text-xs font-mono uppercase tracking-wider">Awaiting AI synthesis compilation...</span>
                            </div>
                          )}
                        </div>

                         {currentStep >= 22 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 p-4 border border-accent/20 rounded-2xl bg-accent/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-accent/5 shrink-0"
                          >
                            <div>
                              <div className="text-[10px] font-bold text-text-primary mb-0.5 uppercase tracking-wide">Founding Member LTDs Available</div>
                              <p className="text-[9px] text-text-secondary font-medium">Deploy Aletheia on your own targets with private database scans.</p>
                            </div>
                            <Link href="/pricing">
                              <Button className="bg-accent hover:bg-accent-hover text-white font-black uppercase text-[9px] tracking-widest h-8 px-4 rounded-xl shadow-md transition-all">
                                Claim Lifetime Deal
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Entities Tab */}
                    {view === 'entities' && (
                      <motion.div
                        key="entities"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-surface/50 border border-border/10 rounded-xl p-4 shadow-xl backdrop-blur-sm flex flex-col flex-1 min-h-0 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mb-3 shrink-0">
                          <Database className="w-4 h-4 text-accent" />
                          <span className="text-[10px] uppercase tracking-widest text-text-secondary font-medium">
                            Discovered Entities ({visibleEntities.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
                          {visibleEntities.map((entity, i) => (
                            <EntityChip key={i} entity={entity} />
                          ))}
                          {visibleEntities.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                              <Database className="w-8 h-8 mb-2 animate-pulse text-accent" />
                              <span className="text-xs font-mono uppercase tracking-wider">Awaiting entity extraction...</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
