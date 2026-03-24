"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, Filter, Shield, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CopyEvidenceButton } from '@/components/dashboard/copy-evidence-button';

export function EvidenceTab({ evidence }: { evidence: any[] }) {
    const [filter, setFilter] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // Extract unique tags from evidence
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        evidence.forEach(ev => {
            if (ev.tags) {
                ev.tags.split(',').forEach((t: string) => tags.add(t.trim().toUpperCase()));
            }
        });
        return Array.from(tags).sort();
    }, [evidence]);

    const sortedAndFilteredEvidence = useMemo(() => {
        let result = [...evidence];
        if (filter) {
            result = result.filter(ev => {
                const evTags = ev.tags ? ev.tags.split(',').map((t: string) => t.trim().toUpperCase()) : [];
                return evTags?.includes(filter);
            });
        }
        // Always sort by highest confidence score first
        return result.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
    }, [evidence, filter]);

    const paginatedEvidence = useMemo(() => {
        return sortedAndFilteredEvidence.slice(0, page * ITEMS_PER_PAGE);
    }, [sortedAndFilteredEvidence, page]);

    const getConfidenceColor = (label: string) => {
        switch (label?.toUpperCase()) {
            case 'HIGH': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'LOW': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-text-tertiary bg-white/5 border-white/10';
        }
    };

    if (evidence.length === 0) {
        return (
            <Card className="border-dashed border-border-bright bg-transparent">
                <CardContent className="h-64 flex flex-col items-center justify-center text-text-tertiary p-8 text-center">
                    <div className="opacity-20 mb-4"><Search className="w-8 h-8" /></div>
                    <p className="text-sm max-w-xs leading-relaxed">No intelligence evidence gathered yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-surface/30 p-4 border border-white/5 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary/80">
                    <Filter className="w-4 h-4 text-accent" />
                    Filter Evidence
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setFilter(null); setPage(1); }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filter === null
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-black/30 border-white/10 text-text-primary/50 hover:bg-white/5 hover:text-text-primary'
                            }`}
                    >
                        All Artifacts
                    </button>
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => { setFilter(tag); setPage(1); }}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filter === tag
                                ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                                : 'bg-black/30 border-white/10 text-text-primary/50 hover:bg-white/5 hover:text-text-primary'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedEvidence.map((ev) => (
                    <EvidenceCard key={ev.id} ev={ev} getConfidenceColor={getConfidenceColor} />
                ))}
            </div>

            {sortedAndFilteredEvidence.length > paginatedEvidence.length && (
                <div className="flex justify-center pt-8 pb-12">
                    <Button 
                        variant="outline" 
                        onClick={() => setPage(p => p + 1)}
                        className="bg-accent/5 border-accent/20 hover:bg-accent/10 group px-8"
                    >
                        Load more intelligence
                        <Search className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform" />
                    </Button>
                </div>
            )}

            {sortedAndFilteredEvidence.length === 0 && filter !== null && (
                <div className="text-center p-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                    <p className="text-sm text-text-tertiary">No evidence artifacts match the selected filter.</p>
                </div>
            )}
        </div>
    );
}

function EvidenceCard({ ev, getConfidenceColor }: { ev: any, getConfidenceColor: (l: string) => string }) {
    const router = useRouter();
    const isPostcard = ev.content?.includes('🪪') || ev.title?.includes('Profile Postcard');
    
    // Extract metadata from markdown content if it's a postcard
    const meta: Record<string, string> = {};
    if (isPostcard) {
        const lines = ev.content.split('\n');
        lines.forEach((line: string) => {
            if (line.startsWith('**Platform:**')) meta.platform = line.replace('**Platform:**', '').trim();
            if (line.startsWith('**Profile Name:**')) meta.name = line.replace('**Profile Name:**', '').trim();
            if (line.startsWith('**Identity:**')) meta.name = line.replace('**Identity:**', '').trim();
            if (line.startsWith('**Direct Link:**')) meta.link = line.replace('**Direct Link:**', '').trim();
        });
        
        // Extract bio
        const bioMatch = ev.content.match(/> ([\s\S]*?)(?:\n\n|$)/);
        if (bioMatch) meta.bio = bioMatch[1].trim();
    }

    return (
        <Card className={`bg-surface border hover:border-accent/40 transition-all duration-500 group overflow-hidden ${isPostcard ? 'border-accent/30 shadow-lg' : 'border-border/10 hover:bg-foreground/5'}`}>
            <CardContent className="p-0 flex flex-col h-full relative">
                {/* Header Background for Postcards */}
                {isPostcard && (
                    <div className="h-20 bg-gradient-to-br from-accent/10 via-background to-background border-b border-border/10 relative overflow-hidden">
                        <div className="absolute top-2 right-2 opacity-[0.03]">
                            <Shield className="w-16 h-16" />
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.05),transparent)]" />
                    </div>
                )}

                <div className="p-6 flex flex-col flex-1 relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <Badge variant="outline" className={`text-[9px] font-mono font-black tracking-widest px-2.5 py-1 rounded-md ${isPostcard ? 'bg-accent text-accent-foreground border-transparent shadow-lg shadow-accent/20' : 'bg-foreground/5 border-border/10 text-text-tertiary'}`}>
                                {ev.tags?.split(',')[0]?.toUpperCase() || 'CORE_VECTOR'}
                            </Badge>
                            {ev.confidenceLabel && (
                                <Badge variant="outline" className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-md tracking-tighter ${getConfidenceColor(ev.confidenceLabel)}`}>
                                    CONF {Math.round(ev.confidenceScore * 100)}%
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                             <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-accent hover:bg-accent/10 rounded-md"
                                title="Pivot Investigation"
                                onClick={() => {
                                    const value = ev.sourceUrl || ev.title;
                                    router.push(`/dashboard/new?target=${encodeURIComponent(value)}`);
                                }}
                             >
                                <Target className="w-3.5 h-3.5" />
                             </Button>
                             <CopyEvidenceButton content={ev.content} />
                        </div>
                    </div>

                    <div className="flex items-start gap-4 mb-6">
                        {isPostcard ? (
                            <div className="w-12 h-12 rounded-xl bg-surface border border-accent/40 shadow-xl flex items-center justify-center text-accent text-lg font-bold shrink-0">
                                {meta.platform?.[0]?.toUpperCase() || '🪪'}
                            </div>
                        ) : (
                            <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${ev.confidenceLabel === 'HIGH' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : ev.confidenceLabel === 'MEDIUM' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-accent shadow-[0_0_10px_rgba(0,240,255,0.5)]'}`} />
                        )}
                        <div className="min-w-0">
                            <h4 className="font-black text-[14px] text-text-primary/90 leading-tight tracking-tight group-hover:text-text-primary transition-colors truncate">
                                {isPostcard ? (meta.name || ev.title) : ev.title}
                            </h4>
                            {isPostcard && (
                                <p className="text-[10px] text-accent font-mono font-bold uppercase tracking-widest mt-1 opacity-70">
                                    Identified_{meta.platform || 'Asset'}
                                </p>
                            )}
                        </div>
                    </div>

                    {isPostcard ? (
                         <div className="flex-1 space-y-5">
                            <div className="p-4 bg-background/20 rounded-2xl border border-border/10 cyber-indent">
                                <span className="text-[9px] text-accent uppercase tracking-[0.2em] font-black mb-1.5 block">Automated_Context</span>
                                <p className="text-[11px] text-text-secondary leading-relaxed font-mono tracking-tight">
                                    {meta.bio ? `"${meta.bio}"` : 'NO_BIO_PROVIDED // METADATA_ISOLATED'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-foreground/[0.02] rounded-xl border border-border/10 group-hover:border-border/20 transition-colors">
                                    <span className="text-[8px] text-text-tertiary uppercase font-bold block opacity-50 mb-0.5">Vector_Node</span>
                                    <span className="text-[10px] text-text-primary font-mono font-bold">{meta.platform || 'Unknown'}</span>
                                </div>
                                <div className="p-3 bg-foreground/[0.02] rounded-xl border border-border/10 group-hover:border-border/20 transition-colors">
                                    <span className="text-[8px] text-text-tertiary uppercase font-bold block opacity-50 mb-0.5">Capture_Date</span>
                                    <span className="text-[10px] text-text-primary font-mono font-bold tracking-tighter">{ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : '00/00/00'}</span>
                                </div>
                            </div>
                         </div>
                    ) : (
                        <div className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap bg-background/20 p-5 rounded-2xl border border-border/10 font-mono max-h-56 overflow-y-auto mb-5 custom-scrollbar group-hover:border-border/20 transition-all">
                            {ev.content}
                        </div>
                    )}

                    {ev.provenanceHash && (
                        <div className="mt-2 p-2.5 bg-success/[0.02] border border-success/10 rounded-xl flex items-center gap-3 group-hover:bg-success/[0.05] transition-all">
                            <div className="p-1 px-2 bg-success/10 rounded-md text-[8px] text-success font-black border border-success/20 tracking-tighter">VERIFIED</div>
                            <div className="text-[9px] text-success/60 font-mono truncate uppercase tracking-tighter">
                                HASH: {ev.provenanceHash}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                        {ev.sourceArchiveUrl ? (
                            <a
                                href={ev.sourceArchiveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-success hover:text-green-300 flex items-center gap-2 transition-colors font-black uppercase tracking-[0.15em] relative group/link pb-0.5"
                            >
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-success group-hover/link:w-full transition-all duration-500" />
                                PERMANENT_LOCK
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ) : ev.sourceUrl ? (
                            <a
                                href={ev.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-accent hover:text-cyan-300 flex items-center gap-2 transition-colors font-black uppercase tracking-[0.15em] relative group/link pb-0.5"
                            >
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover/link:w-full transition-all duration-500" />
                                VIEW_ORIGIN
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ) : (
                            <span className="text-[10px] text-text-tertiary font-mono font-bold opacity-30 uppercase tracking-widest">Aletheia_Node</span>
                        )}

                        <div className="text-[9px] text-text-primary/20 font-mono font-black tracking-widest">
                            {ev.createdAt ? new Date(ev.createdAt).toISOString().substring(11, 19).replace('T', ' ') : '00:00:00'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

    );
}
