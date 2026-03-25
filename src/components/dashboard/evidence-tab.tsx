"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Search, ExternalLink, Filter, Shield, Target, Users, UserCheck, 
    FileText, Calendar, LayoutGrid, List, Globe, Mail, Sparkles, Zap,
    Terminal, Code, Instagram, Twitter, Github, Linkedin, Smartphone,
    Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CopyEvidenceButton } from '@/components/dashboard/copy-evidence-button';

const ECOSYSTEMS = [
    { id: 'social', name: 'Social', icon: Users, color: 'text-pink-400', keywords: ['instagram', 'twitter', 'facebook', 'tiktok', 'snapchat', 'reddit', 'mastodon', 'bluesky'] },
    { id: 'dev', name: 'Dev', icon: Code, color: 'text-purple-400', keywords: ['github', 'gitlab', 'bitbucket', 'npm', 'pypi', 'docker', 'stackoverflow', 'codepen'] },
    { id: 'gaming', name: 'Gaming', icon: LayoutGrid, icon2: '🎮', color: 'text-yellow-400', keywords: ['steam', 'discord', 'twitch', 'xbox', 'playstation', 'epic', 'riot', 'battle.net'] },
    { id: 'media', name: 'Media', icon: Zap, color: 'text-red-400', keywords: ['spotify', 'youtube', 'vimeo', 'soundcloud', 'pinterest', 'behance', 'dribbble'] },
    { id: 'lifestyle', name: 'Lifestyle', icon: Target, color: 'text-green-400', keywords: ['gravatar', 'about.me', 'medium', 'substack', 'strava', 'yelp', 'tripadvisor'] },
    { id: 'leaks', name: 'Threat Intel', icon: Shield, color: 'text-danger', keywords: ['breach', 'leak', 'pastebin', 'cybernews', 'combolist', 'dump'] }
];

export function EvidenceTab({ evidence }: { evidence: any[] }) {
    const [filter, setFilter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [compact, setCompact] = useState(false);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Determine platform-to-ecosystem mapping
    const platformToEcosystem = useMemo(() => {
        const mapping: Record<string, string> = {};
        evidence.forEach(ev => {
            const platform = (ev.tags?.split(',')[0] || '').toLowerCase();
            const content = (ev.content || '').toLowerCase();
            const foundEcosystem = ECOSYSTEMS.find(eco => 
                (platform && eco.keywords.some(k => platform.includes(k))) ||
                eco.keywords.some(k => content.includes(k))
            );
            if (foundEcosystem) mapping[platform] = foundEcosystem.id;
        });
        return mapping;
    }, [evidence]);

    // Build the Frequency Matrix
    const platformFrequency = useMemo(() => {
        const freq: Record<string, { count: number; ecosystem: string }> = {};
        evidence.forEach(ev => {
            const platform = (ev.tags?.split(',')[0] || '').toUpperCase();
            if (!platform) return;
            if (!freq[platform]) {
                freq[platform] = { count: 0, ecosystem: platformToEcosystem[platform.toLowerCase()] || 'other' };
            }
            freq[platform].count++;
        });
        return Object.entries(freq).sort((a,b) => b[1].count - a[1].count);
    }, [evidence, platformToEcosystem]);

    const sortedAndFilteredEvidence = useMemo(() => {
        let result = [...evidence];
        
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            result = result.filter(ev => 
                ev.title?.toLowerCase().includes(s) || 
                ev.content?.toLowerCase().includes(s) ||
                ev.tags?.toLowerCase().includes(s)
            );
        }

        if (filter) {
            result = result.filter(ev => {
                const evTags = ev.tags ? ev.tags.split(',').map((t: string) => t.trim().toUpperCase()) : [];
                return evTags?.includes(filter.toUpperCase());
            });
        }
        
        return result.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
    }, [evidence, filter, searchTerm]);

    const paginatedEvidence = useMemo(() => {
        return sortedAndFilteredEvidence.slice(0, page * ITEMS_PER_PAGE);
    }, [sortedAndFilteredEvidence, page]);

    const getConfidenceColor = (label: string) => {
        switch (label?.toUpperCase()) {
            case 'HIGH': return 'text-green-400 bg-green-400/10 border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'LOW': return 'text-danger bg-danger/10 border-danger/20';
            default: return 'text-text-tertiary bg-white/5 border-white/10';
        }
    };

    if (evidence.length === 0) {
        return (
            <Card className="border-dashed border-border/20 bg-transparent rounded-3xl">
                <CardContent className="h-64 flex flex-col items-center justify-center text-text-tertiary p-8 text-center bg-surface/20">
                    <div className="opacity-20 mb-4 animate-pulse"><Search className="w-10 h-10" /></div>
                    <p className="text-sm font-mono uppercase tracking-widest max-w-xs leading-relaxed">Intelligence Grid Empty</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* High-Density Discovery Matrix */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Digital Footprint Matrix
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary group-focus-within/search:text-accent transition-colors" />
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search findings..."
                                className="bg-surface/50 border border-border/10 rounded-full pl-9 pr-4 py-1.5 text-[11px] font-mono text-text-primary outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all w-48 sm:w-64"
                            />
                        </div>
                        <button 
                            onClick={() => setCompact(!compact)}
                            className="p-2 rounded-xl bg-surface/50 border border-border/10 hover:border-accent/30 text-text-tertiary hover:text-accent transition-all"
                            title={compact ? "Switch to Detail View" : "Switch to Compact View"}
                        >
                            {compact ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {ECOSYSTEMS.map(eco => {
                        const count = evidence.filter(ev => platformToEcosystem[(ev.tags?.split(',')[0] || '').toLowerCase()] === eco.id).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={eco.id}
                                onClick={() => { setFilter(null); setSearchTerm(eco.id); }}
                                className="group/eco relative p-4 rounded-2xl bg-surface/40 border border-white/5 hover:border-accent/40 transition-all duration-500 text-left overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent/5 to-transparent blur-2xl opacity-0 group-hover/eco:opacity-100 transition-opacity`} />
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white/5 border border-white/5 ${eco.color} group-hover/eco:scale-110 transition-transform`}>
                                    <eco.icon className="w-4 h-4" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary group-hover/eco:text-text-primary transition-colors">{eco.name}</div>
                                <div className="text-lg font-black text-text-primary mt-0.5">{count} <span className="text-[9px] font-mono font-normal opacity-40">nodes</span></div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {platformFrequency.slice(0, 15).map(([platform, meta]) => (
                        <button
                            key={platform}
                            onClick={() => { setFilter(platform); setPage(1); }}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold tracking-tight transition-all duration-300 ${filter === platform
                                ? 'bg-accent/10 border-accent/40 text-accent shadow-glow-cyan-sm'
                                : 'bg-surface/30 border-white/5 text-text-tertiary hover:border-white/20 hover:text-text-primary'
                            }`}
                        >
                             <div className={`w-1.5 h-1.5 rounded-full ${ECOSYSTEMS.find(e => e.id === meta.ecosystem)?.color?.replace('text-', 'bg-') || 'bg-text-tertiary'}`} />
                             {platform} <span className="opacity-30">({meta.count})</span>
                        </button>
                    ))}
                    {filter && (
                        <button 
                            onClick={() => setFilter(null)}
                            className="px-3 py-1.5 rounded-xl border border-danger/20 text-danger bg-danger/5 hover:bg-danger/10 text-[10px] font-mono font-bold transition-all"
                        >
                            CLEAR_FILTER [×]
                        </button>
                    )}
                </div>
            </section>

            {/* Evidence Grid */}
            <div className={`grid gap-5 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {paginatedEvidence.map((ev) => (
                    <EvidenceCard key={ev.id} ev={ev} getConfidenceColor={getConfidenceColor} compact={compact} />
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

function EvidenceCard({ ev, getConfidenceColor, compact }: { ev: any, getConfidenceColor: (l: string) => string, compact?: boolean }) {
    const router = useRouter();
    const isPostcard = ev.content?.includes('🪪') || ev.title?.includes('Profile Postcard') || ev.title?.includes('Registered Account') || ev.title?.includes('Gravatar') || ev.title?.includes('Social') || ev.content?.includes('**Platform:**');
    
    // Detect "Tied Identity" or "Pivot Hint"
    const isTiedIdentity = ev.content?.includes('Tied Identity') || ev.content?.includes('[PIVOT_HINT]') || ev.tags?.includes('PIVOT') || ev.content?.includes('Ecosystem Discovery');

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
                const val = line.replace(/\*\*[^*]+\*\*/, '').trim().replace(/^[:\s-]+/, '');
                if (line.startsWith('**Identity:**')) meta.username = val;
                else meta.name = val;
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

        // Clean bio
        if (meta.bio) {
             meta.bio = meta.bio.replace(/[\d\.,kKmM]+\s*Followers,?\s*/i, '')
                                .replace(/[\d\.,kKmM]+\s*Following,?\s*/i, '')
                                .replace(/[\d\.,kKmM]+\s*Posts?\s*-?\s*/i, '')
                                .replace(/A positive registration match was detected on.*?\.\s*/gi, '')
                                .replace(/### 🎯 Ecosystem Discovery:.*?\s*/gi, '')
                                .replace(/Yahoo (Scout|Search|Shopping|News|Finance|Mail|Weather|Search Results).*?\s*/gi, '')
                                .replace(/We did not find results for.*?\.\s*/gi, '')
                                .replace(/Suggestions:.*?\s*/gi, '')
                                .replace(/Showing results for.*?\s*/gi, '')
                                .trim();
             meta.bio = meta.bio.replace(/^.*?\([@a-zA-Z0-9_.-]+\)\s*on\s*[a-zA-Z]+:\s*(&quot;|"|')?/i, '')
                                .replace(/(&quot;|"|')$/, '')
                                .trim();
             
             if (!meta.bio || meta.bio.length < 5) {
                meta.bio = isPostcard ? "Verified account existence confirmed via registry metadata." : "";
             }
        }
        
        if (!meta.name) meta.name = ev.title?.split('|')[0]?.trim() || ev.title;
        if (!meta.platform && ev.title?.includes('LinkedIn')) meta.platform = 'LinkedIn';
        if (!meta.platform && ev.title?.includes('Instagram')) meta.platform = 'Instagram';
        if (!meta.platform && ev.title?.includes('X/Twitter')) meta.platform = 'X/Twitter';
    }

    if (compact) {
        return (
            <Card className={`bg-surface/40 border transition-all duration-500 group overflow-hidden ${isTiedIdentity ? 'border-accent/40 shadow-glow-cyan-sm' : 'border-border/10 hover:border-white/20'}`}>
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-accent text-[10px] font-black shrink-0 overflow-hidden">
                                 {meta.avatar ? <img src={meta.avatar} className="w-full h-full object-cover" /> : meta.platform?.[0]?.toUpperCase() || '🪪'}
                             </div>
                             <div className="min-w-0">
                                 <h4 className="text-[11px] font-black text-text-primary truncate">{meta.platform || (ev.tags?.split(',')[0] || 'IDENT')}</h4>
                                 <p className="text-[9px] text-text-tertiary truncate">@{meta.username || 'target'}</p>
                             </div>
                         </div>
                         {isTiedIdentity && <Zap className="w-3 h-3 text-accent animate-pulse" />}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className={`text-[8px] font-mono font-bold px-1 py-0 ${getConfidenceColor(ev.confidenceLabel)}`}>
                            {Math.round(ev.confidenceScore * 100)}% Match
                        </Badge>
                        <a href={ev.sourceUrl} target="_blank" className="text-[8px] text-text-tertiary hover:text-accent font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                            Link <ExternalLink className="w-2 h-2" />
                        </a>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`bg-surface border hover:border-accent/40 transition-all duration-500 group overflow-hidden ${isTiedIdentity ? 'border-accent/40 shadow-glow-cyan-sm' : isPostcard ? 'border-accent/30 shadow-lg' : 'border-border/10 hover:bg-foreground/5'}`}>
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
                             {isTiedIdentity && (
                                 <Badge className="bg-accent text-black text-[8px] font-black px-1.5 py-0 h-4 uppercase tracking-[0.1em] shadow-glow-cyan-sm">
                                     PIVOTABLE_IDENTITY
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
