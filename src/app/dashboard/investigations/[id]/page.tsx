import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getEffectiveUserId } from '@/lib/auth-utils';
import {
    ArrowLeft,
    FileText,
    Activity,
    User,
    AtSign,
    Mail,
    Phone,
    Globe,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ScanBanner } from '@/components/dashboard/scan-banner';
import { LiveTerminalFeed } from '@/components/dashboard/live-terminal';
import { ScanButton } from '@/components/dashboard/scan-button';
import { InvestigationActions } from '@/components/dashboard/investigation-actions';
import { InvestigationDetailClient } from '@/components/dashboard/investigation-detail-client';
import { serializeData } from '@/lib/serialization';
import { ReportPrintHeader } from '@/components/dashboard/report-print-header';

export default async function InvestigationDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ scanning?: string }>;
}) {
    const { id } = await params;
    const { scanning } = await searchParams;
    const isScanning = scanning === '1';
    const user = await getEffectiveUserId();

    console.log(`[Security] Page access attempt on ${id} by ${user.id}`);

    console.log("[SCAN] Fetching investigation detail for ID:", id);

    let investigationData: any = null;
    
    try {
        // LAYER 1: Full Query (Zero-Trust)
        investigationData = await prisma.investigation.findFirst({
            where: { id, userId: user.id }, // LOCKED TO SESSION USER
            include: {
                evidence: { orderBy: { createdAt: 'desc' } },
                entities: { orderBy: { createdAt: 'desc' } },
                reports: { orderBy: { createdAt: 'desc' }, take: 1 },
                _count: { select: { evidence: true, entities: true } }
            }
        });
    } catch (err: any) {
        console.warn("[Security] fetch layer 1 failed...", err.message);
        
        try {
            // LAYER 2: Minimal locked core
            investigationData = await (prisma.investigation as any).findFirst({
                where: { id, userId: user.id },
                select: {
                    id: true, title: true, description: true, status: true, userId: true,
                    createdAt: true, updatedAt: true, subjectName: true, subjectUsername: true,
                    subjectEmail: true, subjectPhone: true,
                    evidence: { select: { id: true, title: true, type: true, content: true, createdAt: true } },
                    entities: { select: { id: true, type: true, value: true, createdAt: true } },
                    reports: { select: { id: true, title: true, content: true, createdAt: true }, take: 1 },
                    _count: { select: { evidence: true, entities: true } }
                }
            });
        } catch (innerErr: any) {
            console.error("[Security] All detail fetch layers failed:", innerErr.message);
            // LAYER 3: Minimal Core (Still locked to user)
            investigationData = await (prisma.investigation as any).findFirst({
                where: { id, userId: user.id },
                select: { id: true, title: true, status: true }
            });
        }
    }

    if (!investigationData) notFound();

    // CRITICAL: Next.js Server Components cannot pass Date objects or non-POJOs directly to Client Components.
    // We deeply serialize the result here to prevent the "SIGNAL LOST" render crash.
    const safeInvestigation = serializeData({
        ...investigationData,
        evidence: investigationData.evidence || [],
        entities: investigationData.entities || [],
        reports: investigationData.reports || [],
        _count: investigationData._count || { evidence: 0, entities: 0 }
    });

    return (
        <div className="space-y-6 animate-fade-in pb-20 selection:bg-accent/30">
            <ReportPrintHeader 
                title={safeInvestigation.title} 
                target={safeInvestigation.subjectEmail || safeInvestigation.subjectUsername || safeInvestigation.subjectName || safeInvestigation.title} 
            />
            {isScanning && <ScanBanner investigationId={id} />}
            <LiveTerminalFeed isScanning={isScanning} investigationId={id} />

            {/* Sticky Global Navigation & Breadcrumbs */}
            <div className="glass-header -mx-4 px-4 sm:-mx-8 sm:px-8 mb-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-tertiary mb-3 pt-4 uppercase tracking-[0.2em] opacity-60">
                    <Link href="/dashboard" className="hover:text-accent transition-colors">Workspace</Link>
                    <span className="opacity-30">/</span>
                    <Link href="/dashboard/investigations" className="hover:text-accent transition-colors">Grid</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-text-primary truncate max-w-[200px]">{safeInvestigation.title}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5">
                    <div className="flex items-center gap-5">
                        <Link href="/dashboard/investigations">
                            <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/10 bg-foreground/[0.02] hover:bg-accent/10 hover:border-accent/40 rounded-xl transition-all duration-300">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-3xl font-black tracking-tighter text-text-primary">{safeInvestigation.title}</h1>
                                <Badge variant={safeInvestigation.status === 'active' ? 'accent' : 'default'} className="uppercase text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md">
                                    {safeInvestigation.status}
                                </Badge>
                            </div>
                            <p className="text-text-tertiary text-xs font-medium max-w-xl opacity-80 leading-relaxed font-mono tracking-tight">{safeInvestigation.description || "Active intelligence sweep targeting identified vector node."}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ScanButton id={id} />
                        <InvestigationActions investigation={safeInvestigation} />
                        <a href={`/api/investigations/${id}/export`} download>
                            <Button variant="outline" size="sm" className="border-border/10 bg-foreground/[0.02] hover:bg-foreground/[0.05] rounded-xl font-bold uppercase tracking-wider text-[11px]">
                                <FileText className="w-4 h-4 mr-2 text-accent" />
                                Export Dossier
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* Target Vectors Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-1 bg-surface/50 backdrop-blur-xl border-border/10 h-fit shadow-2xl relative overflow-hidden group rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <CardHeader className="pb-4 border-b border-border/10 mb-5 bg-foreground/[0.01]">
                        <CardTitle className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.3em] flex items-center gap-3">
                            <Activity className="w-4 h-4 text-accent animate-pulse" />
                            Target Vectors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10 px-6 pb-8">
                        <VectorItem label="Identified Name" value={safeInvestigation.subjectName} icon={<User className="w-4 h-4 text-text-tertiary/40" />} />
                        <VectorItem label="Handle / Alias" value={safeInvestigation.subjectUsername} icon={<AtSign className="w-4 h-4 text-accent/70" />} />
                        <VectorItem label="Primary Email" value={safeInvestigation.subjectEmail} icon={<Mail className="w-4 h-4 text-success/60" />} />
                        <VectorItem label="Phone Line" value={safeInvestigation.subjectPhone} icon={<Phone className="w-4 h-4 text-text-tertiary/40" />} />
                        <VectorItem label="Infrastructure" value={(safeInvestigation as any).subjectDomain} icon={<Globe className="w-4 h-4 text-cyan-500/60" />} />
                        <VectorItem label="Reference Identity" value={(safeInvestigation as any).subjectImageUrl} icon={<Search className="w-4 h-4 text-text-tertiary/40" />} />
                    </CardContent>
                </Card>

                {/* Content Tabs (Live Refreshed) */}
                <InvestigationDetailClient 
                    investigationId={id}
                    initialEvidence={safeInvestigation.evidence}
                    initialEntities={safeInvestigation.entities}
                    initialReports={safeInvestigation.reports}
                    initialCount={safeInvestigation._count}
                    title={safeInvestigation.title}
                    isScanning={isScanning}
                />
            </div >
        </div >
    );
}

function VectorItem({ label, value, icon }: { label: string, value: string | null, icon: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="group/item">
            <div className="flex items-center gap-2 mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary opacity-70 group-hover/item:text-accent transition-colors duration-300">
                {icon}
                {label}
            </div>
            <div className="text-[12px] font-mono font-bold text-text-primary px-4 py-3 bg-foreground/[0.03] border border-border/5 rounded-xl truncate hover:border-accent/30 transition-all duration-500" title={value || ''}>
                {value}
            </div>
        </div>
    );
}

function EmptyState({ message, icon }: { message: string, icon: React.ReactNode }) {
    return (
        <Card className="border-dashed border-border/10 bg-transparent relative overflow-hidden group">
            <div className="absolute inset-0 scanline opacity-[0.03]" />
            <CardContent className="h-72 flex flex-col items-center justify-center text-text-tertiary p-10 text-center relative z-10">
                <div className="text-accent/20 mb-6 group-hover:text-accent/40 transition-colors duration-700 group-hover:scale-110 transform transition-transform duration-700">
                    {icon}
                </div>
                <h3 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-text-tertiary mb-3">Intelligence Search Suspended</h3>
                <p className="text-[11px] font-mono max-w-[240px] leading-relaxed opacity-60 tracking-tight">{message}</p>
            </CardContent>
        </Card>
    );
}

