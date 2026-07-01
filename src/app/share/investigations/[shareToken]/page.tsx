import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { serializeData } from '@/lib/serialization';
import { Shield, Activity, User, AtSign, Mail, Phone, Globe, FileText, Share2, Calendar, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { EvidenceTab } from '@/components/dashboard/evidence-tab';
import { EntitiesTab } from '@/components/dashboard/entities-tab';
import { IdentityGraph } from '@/components/dashboard/identity-graph';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ shareToken: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { shareToken } = await params;
    const investigation = await prisma.investigation.findFirst({
        where: { shareToken, isShared: true },
        select: { title: true, description: true },
    });

    if (!investigation) {
        return { title: 'Investigation Not Found — Aletheia' };
    }

    return {
        title: `${investigation.title} — Aletheia Intelligence Report`,
        description: investigation.description || `Read-only intelligence dossier shared from Aletheia OSINT Platform.`,
    };
}

export default async function SharedInvestigationPage({ params }: Props) {
    const { shareToken } = await params;

    const investigation = await prisma.investigation.findFirst({
        where: { shareToken, isShared: true },
        include: {
            evidence: { orderBy: { createdAt: 'desc' }, take: 200 },
            entities: { orderBy: { createdAt: 'desc' } },
            reports: { orderBy: { createdAt: 'desc' }, take: 1 },
            _count: { select: { evidence: true, entities: true } },
        },
    });

    if (!investigation) notFound();

    const data = serializeData({
        ...investigation,
        evidence: investigation.evidence || [],
        entities: investigation.entities || [],
        reports: investigation.reports || [],
        _count: investigation._count || { evidence: 0, entities: 0 },
    });

    const tags = data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

    return (
        <div className="min-h-screen bg-background text-text-primary">
            {/* Top Banner */}
            <div className="border-b border-white/5 bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-accent/10 rounded-lg border border-accent/20">
                            <Shield className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-text-primary uppercase tracking-widest">Aletheia</span>
                                <span className="text-[9px] font-bold text-text-tertiary border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Read Only</span>
                            </div>
                            <p className="text-[9px] text-text-tertiary font-mono uppercase tracking-[0.2em]">Intelligence Sharing Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-text-tertiary" />
                        <span className="text-[10px] text-text-tertiary font-mono">Shared Read-Only View</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-black tracking-tighter text-text-primary">{data.title}</h1>
                                <Badge className={`uppercase text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md border ${
                                    data.status === 'active'   ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' :
                                    data.status === 'pending'  ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' :
                                    data.status === 'closed'   ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30' :
                                    'bg-zinc-400/10 text-zinc-400 border-zinc-400/30'
                                }`}>
                                    {data.status}
                                </Badge>
                            </div>
                            {data.description && (
                                <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">{data.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-[10px] text-text-tertiary font-mono">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    <span>Created {new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Database className="w-3 h-3" />
                                    <span>{data._count.evidence} Evidence · {data._count.entities} Entities</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag: string) => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-bold text-accent uppercase tracking-widest">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Target Vectors */}
                <Card className="bg-surface/50 backdrop-blur-xl border-border/10 shadow-lg rounded-2xl">
                    <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-center gap-3 lg:pr-6 lg:border-r border-border/10">
                            <Activity className="w-4 h-4 text-accent" />
                            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.3em] font-bold">Target Vectors</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            {data.subjectName && <VectorItem label="Identified Name" value={data.subjectName} icon={<User className="w-3.5 h-3.5 text-text-tertiary/40" />} />}
                            {data.subjectUsername && <VectorItem label="Handle / Alias" value={data.subjectUsername} icon={<AtSign className="w-3.5 h-3.5 text-accent/70" />} />}
                            {data.subjectEmail && <VectorItem label="Primary Email" value={data.subjectEmail} icon={<Mail className="w-3.5 h-3.5 text-success/60" />} />}
                            {data.subjectPhone && <VectorItem label="Phone Line" value={data.subjectPhone} icon={<Phone className="w-3.5 h-3.5 text-text-tertiary/40" />} />}
                            {data.subjectDomain && <VectorItem label="Infrastructure" value={data.subjectDomain} icon={<Globe className="w-3.5 h-3.5 text-cyan-500/60" />} />}
                        </div>
                    </CardContent>
                </Card>

                {/* Evidence + Entities */}
                <div className="space-y-8">
                    <EvidenceTab evidence={data.evidence} />
                    <EntitiesTab entities={data.entities} investigationId={data.id} readOnly />
                    <IdentityGraph
                        target={data.title}
                        evidence={data.evidence}
                        entities={data.entities}
                        investigationId={data.id}
                        readOnly
                    />
                </div>

                {/* Intelligence Dossier */}
                {data.reports?.length > 0 && (
                    <Card className="bg-surface/30 border-border/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Shield className="w-24 h-24 text-accent" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <div className="flex items-center gap-5 mb-8 border-b border-border/5 pb-6">
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-accent" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight text-text-primary uppercase italic">Intelligence Dossier</h3>
                                    <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-widest font-black">Synthesized by Aletheia Advanced Intelligence</p>
                                </div>
                            </div>
                            <div className="prose prose-sm max-w-none text-text-secondary prose-headings:text-text-primary prose-strong:text-text-primary prose-code:text-accent prose-pre:bg-foreground/[0.03] prose-pre:border-border/10">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{data.reports[0]?.content}</pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="border-t border-white/5 pt-8 pb-4 flex items-center justify-between gap-4 text-[10px] text-text-tertiary font-mono">
                    <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-accent" />
                        <span>Powered by <span className="text-accent font-bold">Aletheia Intelligence Platform</span></span>
                    </div>
                    <Link href="/" className="hover:text-accent transition-colors">
                        aletheia.io →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function VectorItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="group/item flex items-center bg-foreground/[0.03] border border-border/5 rounded-xl px-3 py-2 gap-3 hover:border-accent/30 transition-all duration-500">
            <div className="flex items-center text-text-tertiary opacity-70" title={label}>{icon}</div>
            <div className="text-[11px] font-mono font-bold text-text-primary truncate max-w-[150px]" title={value}>{value}</div>
        </div>
    );
}
