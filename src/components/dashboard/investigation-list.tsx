"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity, Users, Zap, Clock, ArrowRight, CheckSquare, Square, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvestigationActions } from "./investigation-actions";
import { BulkToolbar } from "./bulk-toolbar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Investigation {
    id: string;
    title: string;
    subjectUsername?: string;
    status: 'active' | 'archived' | 'closed' | 'pending';
    updatedAt: string;
}

export function InvestigationList({ investigations }: { investigations: Investigation[] }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const router = useRouter();

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === investigations.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(investigations.map(i => i.id)));
        }
    };

    const handleBulkAction = async (action: 'delete' | 'archive' | 'close') => {
        try {
            const res = await fetch('/api/investigations/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds), action })
            });

            if (!res.ok) throw new Error('Bulk action failed');

            toast.success(`Successfully ${action === 'delete' ? 'deleted' : action + 'd'} ${selectedIds.size} investigations`);
            setSelectedIds(new Set());
            router.refresh();
        } catch (error) {
            toast.error("Bulk operation failed. Please try again.");
        }
    };

    return (
        <div className="space-y-4 relative">
            <BulkToolbar 
                selectedCount={selectedIds.size} 
                onClear={() => setSelectedIds(new Set())} 
                onAction={handleBulkAction}
            />

            {investigations.length > 0 && (
                <div className="flex items-center justify-between px-2 mb-2">
                    <button 
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest hover:text-white transition-colors"
                    >
                        {selectedIds.size === investigations.length ? (
                            <CheckSquare className="w-3.5 h-3.5 text-accent" />
                        ) : (
                            <Square className="w-3.5 h-3.5" />
                        )}
                        {selectedIds.size === investigations.length ? 'Deselect All' : 'Select All Investigations'}
                    </button>
                    {selectedIds.size > 0 && (
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest animate-pulse">
                            {selectedIds.size} Items Selected
                        </span>
                    )}
                </div>
            )}

            {investigations.length === 0 ? (
                <Card className="border-dashed border-border-bright bg-transparent">
                    <CardContent className="h-40 flex flex-col items-center justify-center text-text-tertiary">
                        <Shield className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No investigations found.</p>
                        <Link href="/dashboard/investigations/new" className="mt-4">
                            <Button size="sm" variant="outline">Create Your First Scan</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                investigations.map((inv) => (
                    <Card 
                        key={inv.id} 
                        hover3d 
                        className={`relative group border-border/10 bg-surface/40 backdrop-blur-md hover:bg-surface/60 transition-all duration-500 mb-3 overflow-hidden ${
                            selectedIds.has(inv.id) ? 'ring-1 ring-accent/50 bg-accent/5 border-accent/20' : ''
                        }`}
                    >
                        <Link href={`/dashboard/investigations/${inv.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`View ${inv.title}`} />
                        
                        {/* Status Border Glow */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
                            selectedIds.has(inv.id) ? 'bg-accent' : 
                            inv.status === 'active' ? 'bg-accent shadow-lg shadow-accent/20' : 'bg-border/20'
                        }`} />

                        <CardContent className="p-5 flex items-center justify-between relative z-10 pointer-events-none">
                            <div className="flex items-center gap-5 flex-1">
                                {/* Selection Checkbox */}
                                <div className="pointer-events-auto shrink-0 relative z-20">
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleSelect(inv.id);
                                        }}
                                        className={`w-5 h-5 rounded cursor-pointer transition-all flex items-center justify-center border-2 ${
                                            selectedIds.has(inv.id) 
                                                ? 'bg-accent border-accent text-accent-foreground' 
                                                : 'bg-white/5 border-white/10 hover:border-white/30'
                                        }`}
                                    >
                                        {selectedIds.has(inv.id) && <CheckSquare className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className={`p-2.5 rounded-xl border transition-all duration-500 ${
                                    inv.status === 'active' 
                                        ? 'bg-accent/10 border-accent/30 text-accent' 
                                        : 'bg-foreground/5 border-border/10 text-text-tertiary'
                                }`}>
                                    <Activity className={`w-5 h-5 ${inv.status === 'active' ? 'animate-pulse' : ''}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-text-primary tracking-tight group-hover:text-accent transition-colors">
                                            {inv.title}
                                        </h4>
                                        <span className="text-[8px] font-bold text-text-secondary uppercase tracking-widest border border-border/10 px-1.5 py-0.5 rounded bg-foreground/5">
                                            v.1.0-RPT
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest">
                                            {inv.subjectUsername ? `@${inv.subjectUsername}` : 'Anonymous Subject'}
                                        </p>
                                        <div className="h-1 w-1 rounded-full bg-border/20" />
                                        <div className="text-[10px] text-text-tertiary font-bold uppercase mb-1">Report ID</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 lg:gap-8">
                                {/* Signal Yield Indicator (Simulated for refinement) */}
                                <div className="hidden lg:flex flex-col items-end gap-1 px-4 border-r border-border/10">
                                    <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Report Progress</span>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-accent shadow-sm shadow-accent/20' : 'bg-foreground/5'}`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right hidden sm:block pointer-events-auto">
                                    <p className="text-[9px] uppercase tracking-widest text-text-tertiary mb-1">Last Update</p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary uppercase">
                                        <Clock className="w-3 h-3 text-text-tertiary" />
                                        {new Date(inv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pointer-events-auto z-50">
                                    <Badge className={`text-[9px] font-bold uppercase tracking-widest border ${
                                        inv.status === 'active' 
                                            ? 'bg-accent/20 text-accent border-accent/30' 
                                            : inv.status === 'archived'
                                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                : 'bg-background/20 text-text-secondary border-border/20 group-hover:bg-background/40 group-hover:text-text-primary group-hover:border-border/40 transition-all'
                                    }`}>
                                        {inv.status}
                                    </Badge>
                                    <InvestigationActions investigation={inv as any} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

