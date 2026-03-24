"use client";

import { useEffect, useMemo } from "react";
import { useInvestigation } from "@/context/InvestigationContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Users, LayoutGrid, Zap, Eye, MapPin, Globe, Shield } from 'lucide-react';
import { EvidenceTab } from '@/components/dashboard/evidence-tab';
import { EntitiesTab } from '@/components/dashboard/entities-tab';
import { IdentityGraph } from '@/components/dashboard/identity-graph';
import { FacialAnalysis } from '@/components/dashboard/facial-analysis';
import { HeatmapTab } from '@/components/dashboard/heatmap-tab';
import { AssociatesTab } from '@/components/dashboard/associates-tab';
import { ChainOfCustody } from '@/components/dashboard/chain-of-custody';
import { CapabilityPulse } from '@/components/dashboard/capability-pulse';
import { CapabilityLayer } from '@/lib/osint/registry';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    investigationId: string;
    initialEvidence: any[];
    initialEntities: any[];
    initialReports: any[];
    initialCount: { evidence: number; entities: number };
    title: string;
    isScanning: boolean;
}

export function InvestigationDetailClient({
    investigationId,
    initialEvidence,
    initialEntities,
    initialReports,
    initialCount,
    title,
    isScanning
}: Props) {
    const { 
        evidence, 
        setEvidence, 
        entities, 
        setEntities,
        reports,
        setReports,
        facialMatches,
        setActiveInvestigationId,
        setScanStatus,
        scanStatus,
        startScan
    } = useInvestigation();

    // Sync initial data to context on mount
    useEffect(() => {
        setActiveInvestigationId(investigationId);
        if (evidence.length === 0 && initialEvidence.length > 0) {
            setEvidence(initialEvidence);
        }
        if (entities.length === 0 && initialEntities.length > 0) {
            setEntities(initialEntities);
        }
        // Seed initial reports into context so Summary tab has data on first render
        if (reports.length === 0 && initialReports.length > 0) {
            setReports(initialReports);
        }
        
        // CRITICAL: Trigger scan if we are in 'scanning' mode and status is idle
        if (isScanning && scanStatus === 'idle') {
            startScan(investigationId);
        }
    }, [investigationId, initialEvidence, initialEntities, initialReports, isScanning, startScan, scanStatus]);

    const hasContextData = evidence.length > 0 || entities.length > 0;
    const isActuallyScanning = scanStatus === 'scanning' || isScanning;

    const displayEvidence = isActuallyScanning || (hasContextData && initialEvidence.length === 0) 
        ? evidence 
        : (initialEvidence.length > 0 ? initialEvidence : evidence);

    const displayEntities = isActuallyScanning || (hasContextData && initialEntities.length === 0)
        ? entities
        : (initialEntities.length > 0 ? initialEntities : entities);

    const evidenceCount = Math.max(initialCount.evidence, evidence.length);
    const entitiesCount = Math.max(initialCount.entities, entities.length);

    // Derive active layers from evidence tags
    const activeLayers = useMemo(() => {
        const layers = new Set<CapabilityLayer>();
        displayEvidence.forEach(ev => {
            const tag = ev.tags?.split(',')[0]?.toUpperCase();
            if (tag && Object.values(CapabilityLayer).includes(tag as CapabilityLayer)) {
                layers.add(tag as CapabilityLayer);
            }
            // Fallback mappings for legacy or broad tags
            if (ev.tags?.includes('dns') || ev.tags?.includes('infrastructure')) layers.add(CapabilityLayer.INFRA);
            if (ev.tags?.includes('geolocation')) layers.add(CapabilityLayer.GEO);
            if (ev.tags?.includes('breach') || ev.tags?.includes('identity')) layers.add(CapabilityLayer.IDENTITY);
            if (ev.tags?.includes('social')) layers.add(CapabilityLayer.SOCIAL);
        });
        return Array.from(layers);
    }, [displayEvidence]);

    // Extract Vitality Audit from report
    const vitalityAudit = useMemo(() => {
        const content = initialReports?.[0]?.content || '';
        try {
            const match = content.match(/\[VITALITY_AUDIT: (\{.*?\})\]/);
            if (match && match[1]) {
                return JSON.parse(match[1]);
            }
        } catch (e) {
            console.warn("[VITALITY] Audit parse failed:", e);
        }
        return null;
    }, [initialReports]);

    return (
        <div className="lg:col-span-3 space-y-8">
            {/* Engine Status Pulse */}
            <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary flex items-center gap-2">
                        <Zap className="w-3 h-3 text-accent" /> Intelligence Capability Network
                    </h3>
                    {isActuallyScanning && (
                        <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent animate-pulse font-mono text-[8px] px-2 py-0.5">
                            RECEIVING_LIVE_TELEMERY
                        </Badge>
                    )}
                </div>
                <CapabilityPulse activeLayers={activeLayers} />
            </section>

            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="bg-surface/50 backdrop-blur-3xl border border-border/10 p-1 mb-8 rounded-2xl shadow-2xl h-[52px] flex items-center justify-start overflow-x-auto no-scrollbar gap-1 relative">
                    <TabsTrigger value="summary" className="relative group gap-3 rounded-xl px-6 h-11 transition-all duration-300 data-[state=active]:text-accent border border-transparent font-mono text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                        <LayoutGrid className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Dossier</span>
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TabsTrigger>
                    
                    <TabsTrigger value="evidence" className="relative group gap-3 rounded-xl px-6 h-11 transition-all duration-300 data-[state=active]:text-accent border border-transparent font-mono text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <Database className="w-4 h-4" />
                            <span>Artifacts</span>
                            <Badge variant="default" className="px-1.5 py-0 text-[8px] bg-accent/20 text-accent border-accent/20 font-black shrink-0">{evidenceCount + entitiesCount}</Badge>
                        </div>
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TabsTrigger>

                    <TabsTrigger value="graph" className="relative group gap-3 rounded-xl px-6 h-11 transition-all duration-300 data-[state=active]:text-accent border border-transparent font-mono text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                        <Globe className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Network</span>
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TabsTrigger>

                    <TabsTrigger value="visual" className="relative group gap-3 rounded-xl px-6 h-11 transition-all duration-300 data-[state=active]:text-accent border border-transparent font-mono text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <Eye className="w-4 h-4" />
                            <span>Recon</span>
                            <Badge variant="outline" className="px-1.5 py-0 text-[8px] bg-accent/10 border-accent/20 text-accent font-black shrink-0">AI</Badge>
                        </div>
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TabsTrigger>

                    <TabsTrigger value="audit" className="relative group gap-3 rounded-xl px-6 h-11 transition-all duration-300 data-[state=active]:text-accent border border-transparent font-mono text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">
                        <Shield className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Audit</span>
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="graph" className="animate-in fade-in slide-in-from-bottom-2 space-y-8">
                    <IdentityGraph target={title} evidence={displayEvidence} />
                    <AssociatesTab reportContent={reports[0]?.content || initialReports?.[0]?.content || ''} />
                </TabsContent>

                <TabsContent value="evidence" className="animate-in fade-in slide-in-from-bottom-2 space-y-10">
                    <EntitiesTab entities={displayEntities} investigationId={investigationId} />
                    <EvidenceTab evidence={displayEvidence} />
                </TabsContent>

                <TabsContent value="summary" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="bg-surface/30 border-border/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Shield className="w-24 h-24 text-accent" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <div className="flex items-center gap-5 mb-8 border-b border-border/5 pb-6">
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-glow-cyan-sm">
                                    <Globe className="w-7 h-7 text-accent" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight text-text-primary uppercase italic">Intelligence Dossier</h3>
                                    <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-widest font-black">Synthesized by Aletheia Advanced Intelligence</p>
                                </div>
                            </div>
                            <div className="space-y-4 text-sm text-text-secondary leading-relaxed font-medium">
                                {/* Use live context reports, fall back to SSR initial reports */}
                                {(reports.length > 0 || initialReports.length > 0) ? (
                                    <div className="prose prose-sm max-w-none text-text-secondary prose-headings:text-text-primary prose-strong:text-text-primary prose-code:text-accent prose-pre:bg-foreground/[0.03] prose-pre:border-border/10">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {(reports[0]?.content || initialReports[0]?.content)}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="bg-foreground/[0.02] p-8 rounded-2xl border border-border/10 space-y-6 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/5 mb-2">
                                            <Zap className="w-5 h-5 text-accent animate-pulse" />
                                        </div>
                                        <p className="text-sm font-bold text-text-primary">Automated synthesis of findings for <span className="text-accent underline decoration-accent/30 underline-offset-4 decoration-2">{title}</span>.</p>
                                        <p className="text-xs text-text-tertiary leading-relaxed font-mono uppercase tracking-widest">Active intelligence gathering in progress. Correlation engine is merging available data points...</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="visual" className="animate-in fade-in slide-in-from-bottom-2">
                    <FacialAnalysis 
                        matches={facialMatches} 
                        isScanning={isActuallyScanning} 
                        audit={vitalityAudit}
                    />
                </TabsContent>
                <TabsContent value="audit" className="animate-in fade-in slide-in-from-bottom-2">
                    <ChainOfCustody evidence={displayEvidence} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
