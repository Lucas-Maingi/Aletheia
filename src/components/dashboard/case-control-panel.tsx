"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Tag, StickyNote, Share2, Copy, Check, X, Plus,
    Activity, Archive, CheckCircle2, Clock, ChevronDown,
    Loader2, Lock, Unlock, Shield
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CaseControlPanelProps {
    investigationId: string;
    initialStatus: string;
    initialNotes: string | null;
    initialTags: string;
    initialIsShared: boolean;
    initialShareToken: string | null;
}

const STATUS_OPTIONS = [
    { value: 'active',   label: 'Active',   color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: Activity },
    { value: 'pending',  label: 'Pending',  color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',    icon: Clock },
    { value: 'closed',   label: 'Closed',   color: 'text-cyan-400',    bg: 'bg-cyan-400/10 border-cyan-400/30',      icon: CheckCircle2 },
    { value: 'archived', label: 'Archived', color: 'text-zinc-400',    bg: 'bg-zinc-400/10 border-zinc-400/30',      icon: Archive },
];

export function CaseControlPanel({
    investigationId,
    initialStatus,
    initialNotes,
    initialTags,
    initialIsShared,
    initialShareToken,
}: CaseControlPanelProps) {
    const router = useRouter();

    // Status
    const [status, setStatus] = useState(initialStatus || 'active');
    const [statusOpen, setStatusOpen] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);

    // Tags
    const [tags, setTags] = useState<string[]>(
        initialTags ? initialTags.split(',').map(t => t.trim()).filter(Boolean) : []
    );
    const [tagInput, setTagInput] = useState('');
    const [savingTags, setSavingTags] = useState(false);

    // Notes
    const [notes, setNotes] = useState(initialNotes || '');
    const [savingNotes, setSavingNotes] = useState(false);
    const notesTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sharing
    const [isShared, setIsShared] = useState(initialIsShared);
    const [shareToken, setShareToken] = useState(initialShareToken);
    const [savingShare, setSavingShare] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = shareToken
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/investigations/${shareToken}`
        : null;

    // ─── Status ────────────────────────────────────────────────────────────────

    const changeStatus = async (newStatus: string) => {
        if (newStatus === status) { setStatusOpen(false); return; }
        setSavingStatus(true);
        setStatusOpen(false);
        try {
            const res = await fetch(`/api/investigations/${investigationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed');
            setStatus(newStatus);
            toast.success(`Case status updated to ${newStatus}`);
            router.refresh();
        } catch {
            toast.error('Failed to update status');
        } finally {
            setSavingStatus(false);
        }
    };

    // ─── Tags ──────────────────────────────────────────────────────────────────

    const saveTags = useCallback(async (newTags: string[]) => {
        setSavingTags(true);
        try {
            await fetch(`/api/investigations/${investigationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: newTags.join(',') }),
            });
        } catch {
            toast.error('Failed to save tags');
        } finally {
            setSavingTags(false);
        }
    }, [investigationId]);

    const addTag = () => {
        const clean = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (!clean || tags.includes(clean) || tags.length >= 12) return;
        const next = [...tags, clean];
        setTags(next);
        setTagInput('');
        saveTags(next);
    };

    const removeTag = (tag: string) => {
        const next = tags.filter(t => t !== tag);
        setTags(next);
        saveTags(next);
    };

    // ─── Notes ─────────────────────────────────────────────────────────────────

    const handleNotesChange = (val: string) => {
        setNotes(val);
        if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
        notesTimerRef.current = setTimeout(async () => {
            setSavingNotes(true);
            try {
                await fetch(`/api/investigations/${investigationId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes: val }),
                });
            } catch {
                toast.error('Failed to auto-save notes');
            } finally {
                setSavingNotes(false);
            }
        }, 1200);
    };

    // ─── Sharing ───────────────────────────────────────────────────────────────

    const toggleShare = async () => {
        setSavingShare(true);
        try {
            const res = await fetch(`/api/investigations/${investigationId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enable: !isShared }),
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setIsShared(data.isShared);
            setShareToken(data.shareToken || null);
            if (data.isShared) {
                toast.success('Share link enabled');
            } else {
                toast.success('Share link revoked');
            }
        } catch {
            toast.error('Failed to toggle sharing');
        } finally {
            setSavingShare(false);
        }
    };

    const copyLink = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Share link copied to clipboard');
        setTimeout(() => setCopied(false), 2500);
    };

    // ─── Current Status Config ─────────────────────────────────────────────────

    const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    const StatusIcon = currentStatus.icon;

    return (
        <div className="space-y-4 sticky top-24">
            {/* ── Case Status ── */}
            <Card className="bg-surface/40 backdrop-blur-xl border-border/10 rounded-2xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Case Status</span>
                        {savingStatus && <Loader2 className="w-3 h-3 animate-spin text-accent ml-auto" />}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setStatusOpen(!statusOpen)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 ${currentStatus.bg} ${currentStatus.color}`}
                        >
                            <div className="flex items-center gap-2">
                                <StatusIcon className="w-3.5 h-3.5" />
                                <span className="text-xs font-black uppercase tracking-wider">{currentStatus.label}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {statusOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                {STATUS_OPTIONS.map(opt => {
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => changeStatus(opt.value)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 transition-colors duration-100 ${opt.color} ${opt.value === status ? 'bg-white/5' : ''}`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                            {opt.value === status && <Check className="w-3 h-3 ml-auto opacity-60" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── Tags ── */}
            <Card className="bg-surface/40 backdrop-blur-xl border-border/10 rounded-2xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Tags</span>
                        {savingTags && <Loader2 className="w-3 h-3 animate-spin text-accent ml-auto" />}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-bold text-accent uppercase tracking-widest">
                                {tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-0.5 text-accent/50 hover:text-accent transition-colors"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </span>
                        ))}
                        {tags.length === 0 && (
                            <span className="text-[10px] text-text-tertiary italic font-mono">No tags yet</span>
                        )}
                    </div>

                    <div className="flex gap-1.5">
                        <input
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                            placeholder="Add tag..."
                            maxLength={20}
                            className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg px-2.5 py-1.5 text-[11px] text-white/80 placeholder:text-white/30 outline-none transition-all font-mono"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={addTag}
                            disabled={!tagInput.trim() || tags.length >= 12}
                            className="h-7 w-7 rounded-lg border border-white/10 hover:border-accent/40 hover:bg-accent/10 hover:text-accent transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Investigator Notes ── */}
            <Card className="bg-surface/40 backdrop-blur-xl border-border/10 rounded-2xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <StickyNote className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Case Notes</span>
                        {savingNotes && (
                            <div className="ml-auto flex items-center gap-1.5 text-[9px] text-text-tertiary font-mono">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                Saving...
                            </div>
                        )}
                    </div>
                    <textarea
                        value={notes}
                        onChange={e => handleNotesChange(e.target.value)}
                        placeholder="Record observations, leads, and notes for this case..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent/40 focus:ring-1 focus:ring-accent/20 rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder:text-white/25 outline-none transition-all resize-none font-mono leading-relaxed"
                    />
                </CardContent>
            </Card>

            {/* ── Secure Sharing ── */}
            <Card className="bg-surface/40 backdrop-blur-xl border-border/10 rounded-2xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Share2 className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Secure Share Link</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                            {isShared
                                ? <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                : <Lock className="w-3.5 h-3.5 text-text-tertiary" />
                            }
                            <div>
                                <p className="text-[11px] font-bold text-text-primary">
                                    {isShared ? 'Sharing Enabled' : 'Sharing Disabled'}
                                </p>
                                <p className="text-[9px] text-text-tertiary font-mono">
                                    {isShared ? 'Anyone with the link can view' : 'Only you can access this case'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleShare}
                            disabled={savingShare}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none ${
                                isShared ? 'bg-emerald-400 border-emerald-400' : 'bg-white/10 border-white/20'
                            }`}
                        >
                            {savingShare
                                ? <Loader2 className="w-3 h-3 text-white animate-spin mx-auto" />
                                : <span className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-all duration-300 ${isShared ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            }
                        </button>
                    </div>

                    {isShared && shareUrl && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex gap-1.5">
                                <input
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white/50 font-mono outline-none truncate"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={copyLink}
                                    className={`h-7 w-7 shrink-0 rounded-lg border transition-all duration-200 ${
                                        copied
                                            ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400'
                                            : 'border-white/10 hover:border-accent/40 hover:bg-accent/10 hover:text-accent'
                                    }`}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                            <p className="text-[9px] text-text-tertiary font-mono opacity-60">
                                Read-only access · No account required
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
