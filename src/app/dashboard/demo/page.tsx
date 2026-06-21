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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DEMO_PERSON, DEMO_DOMAIN, CONNECTOR_DISPLAY_NAMES } from '@/lib/demo-data';

// ─── TYPES ──────────────────────────────────────────────────────
type DemoData = typeof DEMO_PERSON | typeof DEMO_DOMAIN;
type EvidenceItem = typeof DEMO_PERSON['evidence'][number];
type EntityItem = typeof DEMO_PERSON['entities'][number];
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
      className="relative group rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-5 overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-accent">{icon}</span>
          <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">
            {label}
          </span>
        </div>
        <p className="text-3xl font-black text-text-primary">{value}</p>
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

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {connector && (
              <span className="text-lg shrink-0" title={connector.name}>
                {connector.icon}
              </span>
            )}
            <h4 className="text-sm font-semibold text-text-primary truncate">{item.title}</h4>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              CONFIDENCE_COLORS[item.confidenceLabel]
            }`}
          >
            {item.confidenceLabel === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {item.confidenceLabel}
          </span>
        </div>

        {/* Content */}
        <div
          className={`text-sm text-text-secondary leading-relaxed mb-3 ${
            !expanded ? 'line-clamp-3' : ''
          }`}
        >
          {item.content}
        </div>

        {item.content.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 mb-3 transition-colors"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium px-1.5 py-0.5 rounded bg-surface-elevated">
              {item.platform}
            </span>
            <span className="text-[10px] text-text-tertiary font-mono">{ts}</span>
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
  const [view, setView] = useState<'evidence' | 'timeline' | 'dossier' | 'entities'>('evidence');

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
  const [demoMode, setDemoMode] = useState<'interactive' | 'cinematic'>('interactive');

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Demo Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-purple-500/15 to-pink-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15),_transparent_60%)]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="accent" size="sm" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  DEMO PORTAL
                </Badge>
                <Badge variant="outline" size="sm">
                  Synthetic Data — No API Calls
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight mb-2">
                Experience Aletheia&apos;s{' '}
                <span className="text-gradient-vibrant">Intelligence Engine</span>
              </h1>
              <p className="text-text-secondary max-w-xl">
                Explore our dual demonstration suite. Test the interactive sandbox or watch the cinematic auto-play sweep.
              </p>
            </div>

            <Link href="/pricing">
              <Button size="lg" className="group shrink-0 shadow-lg shadow-accent/20">
                Get Lifetime Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Demo Mode Switcher ── */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-center">
        <div className="bg-surface/50 border border-border/10 p-1.5 rounded-2xl flex items-center gap-2">
          <button
            onClick={() => setDemoMode('interactive')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all ${
              demoMode === 'interactive'
                ? 'bg-accent text-white shadow-lg shadow-accent/20 border border-accent'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4" />
            Interactive Sandbox
          </button>
          <button
            onClick={() => setDemoMode('cinematic')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all ${
              demoMode === 'cinematic'
                ? 'bg-accent text-white shadow-lg shadow-accent/20 border border-accent'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            <Video className="w-4 h-4" />
            Cinematic Playback
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {demoMode === 'interactive' ? (
          <Tabs defaultValue="person">
            {/* Tab Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <TabsList className="mb-8">
                <TabsTrigger value="person">
                  <User className="w-4 h-4" />
                  Person Investigation
                </TabsTrigger>
                <TabsTrigger value="domain">
                  <Globe className="w-4 h-4" />
                  Domain Investigation
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="person">
              <InvestigationPanel data={DEMO_PERSON} />
            </TabsContent>
            <TabsContent value="domain">
              <InvestigationPanel data={DEMO_DOMAIN} />
            </TabsContent>
          </Tabs>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <CinematicDemo />
          </motion.div>
        )}
      </div>

      {/* ── Sticky CTA Bar ── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="relative overflow-hidden border-t border-accent/20">
          {/* Background */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-purple-500/5 to-pink-500/5" />

          <div className="relative max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 border border-accent/20">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Ready to investigate your own targets?
                </p>
                <p className="text-xs text-text-secondary hidden sm:block">
                  Full access to 12+ intelligence connectors, AI dossier generation, and breach monitoring.
                </p>
              </div>
            </div>

            <Link href="/pricing">
              <Button size="lg" className="group whitespace-nowrap shadow-lg shadow-accent/25">
                <Zap className="w-4 h-4" />
                Claim Lifetime Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
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

function CinematicDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.2); // Speed multiplier
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle/Prompt, 1: Typing, 2: Dispatching, 3: Scanning, 4: AI Synthesis, 5: Complete
  const [typedTarget, setTypedTarget] = useState("");
  const [activeConnectors, setActiveConnectors] = useState<string[]>([]);
  const [finishedConnectors, setFinishedConnectors] = useState<string[]>([]);
  const [visibleEvidence, setVisibleEvidence] = useState<typeof DEMO_PERSON.evidence>([]);
  const [visibleEntities, setVisibleEntities] = useState<typeof DEMO_PERSON.entities>([]);
  const [visibleLogs, setVisibleLogs] = useState<typeof DEMO_PERSON.timeline>([]);
  const [showDossier, setShowDossier] = useState(false);
  const [dossierText, setDossierText] = useState("");
  const [hideControls, setHideControls] = useState(false);

  const targetEmail = "john.doe@example.com";
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play control loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 1000 / speed;

    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next === 1) {
          animateTyping(targetEmail);
          return next;
        }
        
        if (next >= 2 && next <= 12) {
          const logIndex = next - 2;
          if (DEMO_PERSON.timeline[logIndex]) {
            setVisibleLogs((logs) => [...logs, DEMO_PERSON.timeline[logIndex]]);
          }

          if (logIndex === 1) {
            setActiveConnectors(Object.keys(CONNECTOR_DISPLAY_NAMES));
          } else if (logIndex >= 2 && logIndex <= 10) {
            const connectorKeys = Object.keys(CONNECTOR_DISPLAY_NAMES);
            const finishedKey = connectorKeys[logIndex - 2];
            if (finishedKey) {
              setActiveConnectors((active) => active.filter((k) => k !== finishedKey));
              setFinishedConnectors((fin) => [...fin, finishedKey]);
            }

            const evidenceSlice = DEMO_PERSON.evidence.slice(0, logIndex - 1);
            setVisibleEvidence(evidenceSlice);

            const entitiesSlice = DEMO_PERSON.entities.slice(0, logIndex - 1);
            setVisibleEntities(entitiesSlice);
          }
          return next;
        }

        if (next === 13) {
          setVisibleLogs((logs) => [...logs, DEMO_PERSON.timeline[11]]);
          return next;
        }

        if (next === 14) {
          setShowDossier(true);
          animateDossier();
          setVisibleLogs((logs) => [...logs, DEMO_PERSON.timeline[12]]);
          return next;
        }

        if (next > 14) {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return 15;
        }

        return next;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const animateTyping = (text: string) => {
    let index = 0;
    const typingTimer = setInterval(() => {
      setTypedTarget((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(typingTimer);
      }
    }, 50 / speed);
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
    }, 30 / speed);
  };

  const startSimulation = () => {
    resetSimulation();
    setIsPlaying(true);
  };

  const resetSimulation = () => {
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
  };

  const skipToEnd = () => {
    setIsPlaying(false);
    setCurrentStep(15);
    setTypedTarget(targetEmail);
    setActiveConnectors([]);
    setFinishedConnectors(Object.keys(CONNECTOR_DISPLAY_NAMES));
    setVisibleEvidence(DEMO_PERSON.evidence);
    setVisibleEntities(DEMO_PERSON.entities);
    setVisibleLogs(DEMO_PERSON.timeline);
    setShowDossier(true);
    setDossierText(DEMO_PERSON.dossier);
  };

  return (
    <div className="w-full min-h-[650px] bg-black text-white font-sans overflow-hidden flex flex-col relative rounded-2xl border border-zinc-800 shadow-2xl p-6">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* Cinematic Control Panel */}
      <AnimatePresence>
        {!hideControls && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-3 bg-zinc-900/95 border border-zinc-800 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-6"
          >
            <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
              <Video className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Record Studio</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 rounded-full p-0 hover:bg-zinc-800 text-white"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <span className="text-xs font-bold text-yellow-400">PAUSE</span>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={resetSimulation}
                className="h-8 w-8 rounded-full p-0 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={skipToEnd}
                className="h-8 px-3 rounded-full hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white"
              >
                Skip to End
              </Button>
            </div>

            <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Speed:</span>
              <div className="flex gap-1">
                {[0.5, 1, 1.2, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                      speed === s ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setHideControls(true)}
              className="text-zinc-500 hover:text-zinc-300 pl-2 border-l border-zinc-800"
              title="Hide controls (Double click anywhere to show again)"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper trigger to restore controls if hidden */}
      {hideControls && (
        <div 
          className="absolute top-0 left-0 right-0 h-4 z-30 cursor-pointer hover:bg-purple-900/10 transition-colors flex items-center justify-center"
          onClick={() => setHideControls(false)}
          title="Click to show recording controls"
        >
          <div className="w-16 h-1 rounded-full bg-zinc-800" />
        </div>
      )}

      {/* Main Studio Viewport */}
      <div 
        className="flex-1 flex flex-col pt-16 w-full"
        onDoubleClick={() => setHideControls(false)}
      >
        {/* Stage 1: Terminal Input Prompt */}
        {currentStep === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-3 text-[10px] font-mono text-zinc-500 tracking-wider">ALETHEIA INTEL DIRECTORY SWEEP</span>
                </div>
                <Shield className="w-4 h-4 text-purple-500" />
              </div>

              <div className="space-y-4">
                <div className="text-sm font-semibold text-zinc-400">Initiate footprint sweep for target:</div>
                <div className="flex items-center gap-3 p-3 bg-black border border-zinc-900 rounded-lg">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span className="font-mono text-emerald-400">john.doe@example.com</span>
                  <span className="w-1.5 h-4 bg-zinc-500 animate-pulse" />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={startSimulation}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Auto-Play Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stage 2: Active Investigation Board */}
        {currentStep > 0 && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Scan Status & Console Logs */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Scan Status Panel */}
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 shadow-xl backdrop-blur-md">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Investigation Engine</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-md font-bold truncate text-white">{DEMO_PERSON.investigation.title}</h2>
                    <span className="text-[10px] text-zinc-400">Subject: John Michael Doe</span>
                  </div>
                  {currentStep >= 14 ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 px-2.5 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      COMPLETE
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1.5 px-2.5 py-1 animate-pulse">
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      SCANNING
                    </Badge>
                  )}
                </div>

                {/* Simulated Connector Matrix */}
                <div className="border-t border-zinc-900 pt-4">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Connectors Running ({visibleEntities.length}/12)</h4>
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
                              ? "bg-purple-500/5 border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.1)]"
                              : "bg-zinc-900/20 border-zinc-950 text-zinc-600"
                          }`}
                        >
                          <div className="text-xs mb-1">{value.icon}</div>
                          <div className="text-[9px] truncate font-mono">{value.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Console Logs */}
              <div className="flex-1 bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Live Log Feed</h3>
                <div className="flex-1 font-mono text-[10px] space-y-2.5 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
                  <AnimatePresence initial={false}>
                    {visibleLogs.map((log, index) => {
                      let typeColor = "text-zinc-500";
                      if (log.type === "social" || log.type === "professional") typeColor = "text-purple-400";
                      if (log.type === "breach") typeColor = "text-red-400";
                      if (log.type === "infrastructure" || log.type === "geolocation") typeColor = "text-blue-400";
                      if (log.type === "ai") typeColor = "text-yellow-400 font-bold";
                      if (log.type === "complete") typeColor = "text-emerald-400 font-bold";

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-zinc-600">[{log.time}]</span>
                          <span className={`${typeColor}`}>{log.event}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* CENTER & RIGHT COLUMN: Entities, Evidence, & Dossier */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Discovered Entities Board */}
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 shadow-xl backdrop-blur-md">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Discovered Targets & Pivots</h3>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {visibleEntities.map((entity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                      >
                        {entity.type === "email" && <Mail className="w-3 h-3 text-purple-400" />}
                        {entity.type === "username" && <User className="w-3 h-3 text-purple-400" />}
                        {entity.type === "domain" && <Globe className="w-3 h-3 text-blue-400" />}
                        {entity.type === "ip" && <Hash className="w-3 h-3 text-blue-400" />}
                        {entity.type === "location" && <MapPin className="w-3 h-3 text-emerald-400" />}
                        {entity.type === "name" && <User className="w-3 h-3 text-zinc-400" />}
                        
                        <span>{entity.value}</span>
                        <span className="text-[8px] text-zinc-500 bg-black px-1 rounded-sm">{entity.confidence}%</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Live Intelligence Feed or Dossier */}
              <div className="flex-1 min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                  {!showDossier ? (
                    // Evidence Card Grid
                    <motion.div
                      key="evidence"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {visibleEvidence.map((ev) => (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-zinc-950/70 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/30 border border-purple-900/30 px-2 py-0.5 rounded-full">
                                {ev.platform}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                ev.confidenceLabel === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400" :
                                ev.confidenceLabel === "HIGH" ? "bg-blue-500/10 text-blue-400" : "bg-zinc-800 text-zinc-400"
                              }`}>
                                {ev.confidenceLabel}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mb-1.5">{ev.title}</h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-3">{ev.content}</p>
                          </div>
                          <div className="text-[8px] text-zinc-600 font-mono mt-3 text-right">
                            {ev.timestamp.split("T")[1].replace("Z", "")}
                          </div>
                        </motion.div>
                      ))}
                      {visibleEvidence.length === 0 && (
                        <div className="col-span-2 flex-1 flex flex-col items-center justify-center text-zinc-600">
                          <Database className="w-10 h-10 mb-2 animate-bounce" />
                          <span className="text-xs font-mono">Awaiting connector ingestion...</span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    // Dossier Display
                    <motion.div
                      key="dossier"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 bg-zinc-950/80 border border-zinc-900 rounded-xl p-6 shadow-2xl backdrop-blur-md flex flex-col font-mono text-xs text-zinc-300 leading-relaxed overflow-y-auto max-h-[400px]"
                    >
                      <div className="flex items-center gap-2 text-yellow-400 mb-4 border-b border-zinc-900 pb-3">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-bold uppercase tracking-wider">AI Executive Dossier Synthesis</span>
                      </div>
                      
                      <div className="whitespace-pre-wrap flex-1 scrollbar-thin">
                        {dossierText}
                      </div>

                      {currentStep >= 15 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="mt-6 p-4 border border-purple-500/30 rounded-xl bg-purple-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                        >
                          <div>
                            <div className="text-xs font-bold text-white mb-1">Founding Member LTDs Available</div>
                            <p className="text-[10px] text-zinc-400">Deploy Aletheia on your own target domains and investigators.</p>
                          </div>
                          <Link href="/pricing">
                            <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] h-8 rounded-lg">
                              Claim Lifetime Deal →
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
