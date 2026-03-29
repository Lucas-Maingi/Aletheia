"use client";

import { useEffect, useState } from 'react';
import { 
    MessageCircle, Send, Bug, Lightbulb, MessageSquare, 
    Clock, CheckCircle, ChevronRight, User, AlertCircle,
    RotateCcw, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function AdminFeedbackPage() {
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
    const [reply, setReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/feedback');
            if (res.ok) {
                const data = await res.json();
                setFeedback(data);
            }
        } catch (error) {
            toast.error('Failed to command-link to intelligence feed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleReply = async () => {
        if (!selectedFeedback || !reply.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/feedback/${selectedFeedback.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ replyContent: reply }),
            });

            if (res.ok) {
                toast.success('Reply transmitted to operative.');
                setReply('');
                setSelectedFeedback(null);
                fetchFeedback();
            }
        } catch (error) {
            toast.error('Transmission failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'pending' ? 'reviewed' : 'pending';
        try {
            const res = await fetch(`/api/admin/feedback/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
            });
            if (res.ok) {
                fetchFeedback();
            }
        } catch (e) {
            toast.error('Status sync failed.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Synching Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="w-6 h-6 text-accent" />
                        Admin Terminal
                    </h1>
                    <p className="text-text-tertiary text-xs font-medium uppercase tracking-[0.1em] mt-1">Intelligence Feedback & Support Nexus</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    <span className="text-accent">{feedback.filter(f => f.status === 'pending').length} Unhandled Reports</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>Total Archive: {feedback.length}</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                {/* Feedback List */}
                <div className="space-y-4">
                    {feedback.length === 0 ? (
                        <div className="p-20 border border-dashed border-white/5 rounded-3xl bg-surface-2/50 text-center">
                            <MessageSquare className="w-10 h-10 text-white/5 mx-auto mb-4" />
                            <p className="text-sm text-white/20 font-medium tracking-tight">Intelligence buffer is currently empty.</p>
                        </div>
                    ) : feedback.map((item) => (
                        <div 
                            key={item.id}
                            className={`group relative p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                                selectedFeedback?.id === item.id 
                                ? 'bg-accent/5 border-accent/40 shadow-[0_0_30px_rgba(0,240,255,0.05)]' 
                                : 'bg-surface/40 border-white/5 hover:border-white/10 hover:bg-surface/60'
                            }`}
                            onClick={() => setSelectedFeedback(item)}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-background/50 border border-white/5 ${
                                        item.type === 'bug' ? 'text-danger' : 
                                        item.type === 'feature' ? 'text-yellow-400' : 'text-accent'
                                    }`}>
                                        {item.type === 'bug' ? <Bug className="w-4 h-4" /> : 
                                         item.type === 'feature' ? <Lightbulb className="w-4 h-4" /> : 
                                         <MessageSquare className="w-4 h-4" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white uppercase tracking-wider">{item.type} Report</span>
                                        <span className="text-[10px] text-text-tertiary font-medium">v{item.version || '1.0.0'} • {formatDistanceToNow(new Date(item.createdAt))} ago</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={`uppercase text-[9px] font-black tracking-widest px-2.5 py-0.5 ${
                                        item.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                        item.status === 'reviewed' ? 'bg-accent/10 text-accent border-accent/20' : 
                                        'bg-white/5 text-text-tertiary border-white/10'
                                    }`}>
                                        {item.status}
                                    </Badge>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleStatus(item.id, item.status); }}
                                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-text-tertiary hover:bg-white/10 hover:text-white transition-all shadow-sm active:scale-95"
                                        title="Toggle Review Status"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-sm text-text-secondary leading-relaxed mb-6 group-hover:text-text-primary transition-colors line-clamp-3">
                                {item.content}
                            </p>

                            <div className="flex items-center justify-between text-[10px] font-bold text-text-tertiary uppercase tracking-widest border-t border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center">
                                        <User className="w-3 h-3 text-accent" />
                                    </div>
                                    <span>{item.user?.email || 'Anonymous Operative'}</span>
                                </div>
                                <div className="flex items-center gap-1 group-hover:text-accent transition-colors">
                                    Review Dossier <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Panel */}
                <div className="space-y-6">
                    <div className="sticky top-24 p-8 rounded-3xl bg-surface-2 border border-white/5 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageCircle className="w-32 h-32 text-accent" />
                        </div>

                        {selectedFeedback ? (
                            <div className="relative z-10 space-y-6 text-center lg:text-left animate-in fade-in duration-500">
                                <div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3">
                                        <Clock className="w-3 h-3" />
                                        Active Command Session
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Responding to Operative</h3>
                                    <p className="text-xs text-text-tertiary mt-2">Replying to {selectedFeedback.user?.email || 'Anonymous'}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-background/50 border border-white/5 italic text-sm text-text-secondary">
                                    "{selectedFeedback.content}"
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-1">Tactical Response</label>
                                    <Textarea 
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Enter intelligence confirmation or resolution notes..."
                                        className="min-h-[150px] bg-background border-white/10 text-sm leading-relaxed focus:ring-accent/20"
                                    />
                                </div>

                                <Button 
                                    onClick={handleReply}
                                    disabled={isSubmitting || !reply.trim()}
                                    className="w-full bg-accent hover:bg-accent-hover text-white font-black py-6 shadow-xl shadow-accent/10"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Syncing Response...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 uppercase tracking-widest text-[11px]">
                                            Transmit Intelligence
                                            <Send className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>

                                {selectedFeedback.replyContent && (
                                    <div className="pt-6 border-t border-white/5 mt-6">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-3 h-3" /> Previous Response Logged
                                        </p>
                                        <p className="text-[11px] text-text-tertiary bg-white/5 p-3 rounded-lg border border-white/5 italic">
                                            "{selectedFeedback.replyContent}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <AlertCircle className="w-6 h-6 text-white/20" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white/40 mb-1">Select intelligence</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Awaiting sector report selection</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
