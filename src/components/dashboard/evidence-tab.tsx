"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, Filter, Shield, Target, Users, UserCheck, FileText, Calendar } from 'lucide-react';
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
    const isPostcard = ev.content?.includes('🪪') || ev.title?.includes('Profile Postcard') || ev.title?.includes('Registered Account') || ev.title?.includes('Gravatar') || ev.title?.includes('Social');
    
    // Extract metadata from markdown content if it's a postcard
    const meta: Record<string, string> = {
        avatar: ev.metadata?.avatarUrl || null
    };
    const stats: Record<string, string> = {};

    if (isPostcard) {
        const lines = ev.content.split('\n');
        lines.forEach((line: string) => {
            if (line.startsWith('**Platform:**')) meta.platform = line.replace('**Platform:**', '').trim();
            if (line.startsWith('**Profile Name:**') || line.startsWith('**Identity:**') || line.startsWith('**Profile Identity:**')) {
                meta.name = line.replace(/\*\*[^*]+\*\*/, '').trim();
            }
            if (line.startsWith('**Direct Link:**')) meta.link = line.replace('**Direct Link:**', '').trim();
            if (line.startsWith('Avatar:')) meta.avatar = line.replace('Avatar:', '').trim();
        });
        
        // Extract stats from content
        const folMatch = ev.content.match(/([\d\.,kKmM]+)\s*Followers/i);
        if(folMatch) stats.followers = folMatch[1];
        
        const fwiMatch = ev.content.match(/([\d\.,kKmM]+)\s*Following/i);
        if(fwiMatch) stats.following = fwiMatch[1];
        
        const posMatch = ev.content.match(/([\d\.,kKmM]+)\s*Posts?/i);
        if(posMatch) stats.posts = posMatch[1];

        const joinedMatch = ev.content.match(/Joined\s+([^>\n]+)/i);
        if(joinedMatch) stats.joined = joinedMatch[1].trim();
        
        // Extract Username if missing
        if (!meta.username) {
            const userMatch = ev.title?.match(/@([a-zA-Z0-9_.-]+)/) || ev.content?.match(/@([a-zA-Z0-9_.-]+)/);
            if(userMatch) meta.username = userMatch[1];
        }

        // Extract bio
        const bioMatch = ev.content.match(/> ([\s\S]*?)(?:\n\n|$)/);
        if (bioMatch) meta.bio = bioMatch[1].trim();
        
        if (!meta.bio) {
            const gravatarBio = ev.content.match(/Bio: (.*)/);
            if (gravatarBio) meta.bio = gravatarBio[1].trim();
        }

        // Clean bio by stripping out the raw stats string to avoid duplication
        if (meta.bio) {
             meta.bio = meta.bio.replace(/[\d\.,kKmM]+\s*Followers,?\s*/i, '')
                                .replace(/[\d\.,kKmM]+\s*Following,?\s*/i, '')
                                .replace(/[\d\.,kKmM]+\s*Posts?\s*-?\s*/i, '')
                                .trim();
             // Remove common prefix patterns like: "Name (@username) on Platform: "
             meta.bio = meta.bio.replace(/^.*?\([@a-zA-Z0-9_.-]+\)\s*on\s*[a-zA-Z]+:\s*(&quot;|"|')?/i, '')
                                .replace(/(&quot;|"|')$/, '')
                                .trim();
        }
        
        // Final fallback for missing name/platform
        if (!meta.name) meta.name = ev.title?.split('|')[0]?.trim() || ev.title;
        if (!meta.platform && ev.title?.includes('LinkedIn')) meta.platform = 'LinkedIn';
        if (!meta.platform && ev.title?.includes('Instagram')) meta.platform = 'Instagram';
        if (!meta.platform && ev.title?.includes('X/Twitter')) meta.platform = 'X/Twitter';
    }

    return (
        <Card className={`bg-surface border hover:border-accent/40 transition-all duration-500 group overflow-hidden ${isPostcard ? 'border-accent/30 shadow-lg' : 'border-border/10 hover:bg-foreground/5'}`}>
            <CardContent className="p-0 flex flex-col h-full relative">
                <div className="p-5 flex flex-col flex-1 relative z-10">
                    {/* Top Bar: Platform & Confidence */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             {isPostcard && meta.platform ? (
                                 <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest">
                                     {meta.platform}
                                 </Badge>
                             ) : (
                                <Badge variant="outline" className={`text-[9px] font-mono font-black tracking-widest px-2 py-0.5 rounded-md ${isPostcard ? 'bg-accent/10 text-accent border-accent/20' : 'bg-foreground/5 border-border/10 text-text-tertiary'}`}>
                                    {ev.tags?.split(',')[0]?.toUpperCase() || 'CORE_EVIDENCE'}
                                </Badge>
                             )}
                        </div>
                        <div className="flex items-center gap-2">
                            {ev.confidenceLabel && (
                                <Badge variant="outline" className={`text-[8px] font-mono font-bold px-1.5 py-0 rounded-md tracking-tighter ${getConfidenceColor(ev.confidenceLabel)}`}>
                                    {Math.round(ev.confidenceScore * 100)}%
                                </Badge>
                            )}
                            <div className="opacity-30 group-hover:opacity-100 transition-opacity">
                                <CopyEvidenceButton content={ev.content} />
                            </div>
                        </div>
                    </div>

                    {/* Identity Block */}
                    <div className="flex items-center gap-3 mb-4">
                        {isPostcard ? (
                            <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border/20 shadow-sm flex items-center justify-center text-accent text-sm font-bold shrink-0 overflow-hidden relative">
                                {meta.avatar ? (
                                    <img src={meta.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="relative z-10">{meta.platform?.[0]?.toUpperCase() || '🪪'}</span>
                                )}
                            </div>
                        ) : (
                            <div className={`w-2 h-2 rounded-full shrink-0 ${ev.confidenceLabel === 'HIGH' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : ev.confidenceLabel === 'MEDIUM' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-accent shadow-[0_0_10px_rgba(0,240,255,0.5)]'}`} />
                        )}
                        <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-[13px] text-text-primary/95 leading-tight tracking-tight truncate" title={isPostcard ? meta.name : ev.title}>
                                {isPostcard ? meta.name : ev.title}
                            </h4>
                            {isPostcard && meta.username && (
                                <p className="text-[11px] text-accent/80 font-mono mt-0.5 truncate">
                                    @{meta.username}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    {isPostcard ? (
                         <div className="flex-1 flex flex-col gap-3">
                             {/* Stats Row */}
                             {(stats.followers || stats.following || stats.posts) && (
                                 <div className="flex gap-2">
                                     {stats.followers && (
                                         <div className="flex-1 bg-background/40 rounded-lg py-2 flex flex-col items-center justify-center border border-border/5">
                                             <span className="text-[12px] font-black text-text-primary tracking-tight">{stats.followers}</span>
                                             <span className="text-[8px] text-text-tertiary uppercase tracking-widest font-bold mt-0.5">Followers</span>
                                         </div>
                                     )}
                                     {stats.following && (
                                         <div className="flex-1 bg-background/40 rounded-lg py-2 flex flex-col items-center justify-center border border-border/5">
                                             <span className="text-[12px] font-black text-text-primary tracking-tight">{stats.following}</span>
                                             <span className="text-[8px] text-text-tertiary uppercase tracking-widest font-bold mt-0.5">Following</span>
                                         </div>
                                     )}
                                     {stats.posts && (
                                         <div className="flex-1 bg-background/40 rounded-lg py-2 flex flex-col items-center justify-center border border-border/5">
                                             <span className="text-[12px] font-black text-text-primary tracking-tight">{stats.posts}</span>
                                             <span className="text-[8px] text-text-tertiary uppercase tracking-widest font-bold mt-0.5">Posts</span>
                                         </div>
                                     )}
                                 </div>
                             )}
                             
                             {/* Bio Box */}
                             {meta.bio && meta.bio !== 'null' && meta.bio.length > 2 && (
                                 <div className="p-3 bg-foreground/[0.02] rounded-xl border border-border/5 group-hover:border-border/10 transition-colors">
                                     <p className="text-[11px] text-text-secondary leading-relaxed font-mono tracking-tight line-clamp-3" title={meta.bio}>
                                         {meta.bio}
                                     </p>
                                 </div>
                             )}
                             
                             {stats.joined && (
                                 <div className="flex items-center gap-1.5 text-[9px] text-text-tertiary font-mono uppercase font-bold mt-1">
                                     <Calendar className="w-3 h-3 text-text-tertiary/60" />
                                     Joined {stats.joined}
                                 </div>
                             )}
                         </div>
                    ) : (
                        <div className="text-[11px] text-text-secondary flex-1 leading-relaxed whitespace-pre-wrap bg-background/20 p-4 rounded-xl border border-border/10 font-mono max-h-40 overflow-y-auto mb-4 custom-scrollbar">
                            {ev.content}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            {ev.sourceArchiveUrl ? (
                                <a
                                    href={ev.sourceArchiveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-success hover:text-green-300 flex items-center gap-1.5 transition-colors font-black uppercase tracking-[0.15em]"
                                >
                                    PERMANENT_LOCK <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            ) : ev.sourceUrl ? (
                                <a
                                    href={ev.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-accent hover:text-cyan-300 flex items-center gap-1.5 transition-colors font-black uppercase tracking-[0.15em]"
                                >
                                    VIEW_ORIGIN <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            ) : (
                                <span className="text-[9px] text-text-tertiary font-mono font-bold opacity-30 uppercase tracking-widest">Internal_Node</span>
                            )}
                        </div>
                        <div className="text-[9px] text-text-primary/30 font-mono font-bold tracking-widest">
                            {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : '00/00/00'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

    );
}
