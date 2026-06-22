"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
    MessageSquare, X, Send, ImageIcon, Loader2, 
    Sparkles, Layers, Bot, ChevronUp, ChevronDown 
} from "lucide-react";
import { ChatMessage, ChatMessageData } from "@/components/dashboard/chat-message";
import { Button } from "@/components/ui/button";

function generateId() {
    return Math.random().toString(36).slice(2, 12);
}

function detectType(v: string) {
    const val = v.trim();
    if (!val) return null;
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/.test(val)) return 'crypto';
    if (/^0x[a-fA-F0-9]{40}$/i.test(val)) return 'crypto';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'email';
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return 'domain';
    if (/^\+?[0-9\s-]{8,}$/.test(val)) return 'phone';
    if (val.includes(' ')) return 'name';
    return 'username';
}

const WELCOME_MESSAGES = {
    support: {
        id: 'welcome',
        role: 'agent' as const,
        content: `Welcome to Aletheia Support.\n\nAsk me anything about the platform:\n• How does the Target Sweep work?\n• What are Watchlists and how do I set them up?\n• Tell me about the lifetime billing tiers.\n• How do I use the Vehicle Registry or LPR scanner?\n• Where can I configure my API keys?`,
        status: 'complete' as const,
        timestamp: new Date(),
    },
    copilot: {
        id: 'welcome',
        role: 'agent' as const,
        content: `Case Co-Pilot Subsystem Initialized.\n\nSelect cases in the top selection dropdown to analyze cross-case connections:\n• Look for overlaps across the cases.\n• Analyze specific breach logs.\n• Recommend pivot targets.\n• Draft a threat summary.`,
        status: 'complete' as const,
        timestamp: new Date(),
    }
};

export function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'support' | 'copilot'>('support');
    const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME_MESSAGES.support]);
    const [input, setInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [detectedBadge, setDetectedBadge] = useState<string | null>(null);
    const [allInvestigations, setAllInvestigations] = useState<any[]>([]);
    const [selectedInvestigationIds, setSelectedInvestigationIds] = useState<string[]>([]);
    const [showCaseSelector, setShowCaseSelector] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Mode Welcome Message swap
    useEffect(() => {
        if (messages.length === 1 && messages[0].id === 'welcome') {
            setMessages([WELCOME_MESSAGES[mode]]);
        }
    }, [mode]);

    // Pivot Handler for Chat Messages
    useEffect(() => {
        (window as any).pivotTo = (target: string) => {
            setInput(target);
            setIsOpen(true);
            setTimeout(() => handleSend(), 100);
        };
        return () => { delete (window as any).pivotTo; };
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isOpen]);

    // Auto-detect input type
    useEffect(() => {
        setDetectedBadge(detectType(input));
    }, [input]);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const fetchAllInvestigations = useCallback(async () => {
        try {
            const res = await fetch('/api/investigations');
            if (!res.ok) return;
            const data = await res.json();
            setAllInvestigations(data);
        } catch (e) {
            console.error('[FloatingChat] Failed to fetch all investigations:', e);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchAllInvestigations();
        }
    }, [isOpen, fetchAllInvestigations]);

    const handleSend = async () => {
        if (sending) return;
        const text = input.trim();
        if (!text && !imagePreview) return;

        setSending(true);

        // Map messages to Gemini history format
        const history = messages
            .filter(m => m.id !== 'welcome' && (m.status === 'complete' || m.role === 'user'))
            .map(m => ({
                role: m.role === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: m.content }]
            }));

        // Add user message
        const userMsg: ChatMessageData = {
            id: generateId(),
            role: 'user',
            content: text,
            imageUrl: imagePreview || undefined,
            detectedType: text ? (detectType(text) || undefined) : (imagePreview ? 'image' : undefined),
            timestamp: new Date(),
        };

        // Add agent placeholder
        const agentMsgId = generateId();
        const agentMsg: ChatMessageData = {
            id: agentMsgId,
            role: 'agent',
            content: mode === 'support'
                ? 'Searching documentation...'
                : 'Analyzing case intelligence...',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg, agentMsg]);
        setInput('');
        setImagePreview(null);
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        try {
            const geminiKey = typeof window !== 'undefined'
                ? localStorage.getItem('openvector_gemini_key') : null;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (geminiKey) headers['x-gemini-key'] = geminiKey;

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers,
                body: JSON.stringify({ 
                    message: text, 
                    imageUrl: imagePreview,
                    selectedInvestigationIds: mode === 'copilot' ? selectedInvestigationIds : undefined,
                    mode: mode,
                    history: history.length > 0 ? history : undefined
                }),
            });

            if (!res.ok) throw new Error('Failed to reach analysis cluster');

            const data = await res.json();

            setMessages(prev => prev.map(m =>
                m.id === agentMsgId ? { 
                    ...m, 
                    content: data.content || m.content,
                    status: 'complete'
                } : m
            ));
        } catch (err: any) {
            setMessages(prev => prev.map(m =>
                m.id === agentMsgId ? {
                    ...m,
                    content: `Synchronization interrupted: ${err.message}. Please retry.`,
                    status: 'error' as const,
                } : m
            ));
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Expanded Chat Overlay */}
            {isOpen && (
                <div className="w-[420px] h-[580px] bg-surface-elevated/95 backdrop-blur-2xl border border-border/10 rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="shrink-0 border-b border-border/10 bg-surface/80 px-4 py-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                                <Bot className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Aletheia Co-Pilot</h3>
                                <p className="text-[9px] text-text-tertiary font-bold uppercase tracking-widest mt-0.5 leading-none">Neural Link Active</p>
                            </div>
                        </div>
                        
                        {/* Compact Segmented Control */}
                        <div className="flex items-center bg-foreground/[0.03] border border-border/10 rounded-xl p-0.5 gap-0.5">
                            <button
                                onClick={() => setMode('support')}
                                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                    mode === 'support'
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                }`}
                            >
                                Support
                            </button>
                            <button
                                onClick={() => {
                                    setMode('copilot');
                                    fetchAllInvestigations();
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                    mode === 'copilot'
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                }`}
                            >
                                Co-Pilot
                            </button>
                        </div>

                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="p-1.5 rounded-lg hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors"
                        >
                            <X className="w-4.5 h-4.5" />
                        </button>
                    </div>

                    {/* Case Selector Dropdown (for Co-Pilot Mode) */}
                    {mode === 'copilot' && (
                        <div className="shrink-0 border-b border-border/10 bg-surface/30">
                            <button 
                                onClick={() => setShowCaseSelector(!showCaseSelector)}
                                className="w-full px-4 py-2 flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5 text-accent" />
                                    Active Cases Selected ({selectedInvestigationIds.length})
                                </span>
                                {showCaseSelector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            
                            {showCaseSelector && (
                                <div className="max-h-48 overflow-y-auto p-3 space-y-1.5 border-t border-border/10 bg-background/50 no-scrollbar">
                                    {allInvestigations.length === 0 ? (
                                        <div className="p-4 text-center text-[9px] font-bold text-text-tertiary uppercase tracking-wider">No active cases found</div>
                                    ) : (
                                        allInvestigations.map((item) => {
                                            const isChecked = selectedInvestigationIds.includes(item.id);
                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (isChecked) {
                                                            setSelectedInvestigationIds(prev => prev.filter(id => id !== item.id));
                                                        } else {
                                                            setSelectedInvestigationIds(prev => [...prev, item.id]);
                                                        }
                                                    }}
                                                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all text-left ${
                                                        isChecked 
                                                            ? 'bg-accent/10 border-accent/30 text-accent' 
                                                            : 'bg-surface-elevated/20 border-border/10 text-text-secondary hover:bg-surface-elevated/40'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={() => {}} // parent handled
                                                        className="h-3 w-3 rounded text-accent bg-background border-border/10 accent-accent"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-bold uppercase tracking-wide truncate">{item.title}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5 no-scrollbar bg-background/20">
                        {messages.map(msg => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                        {sending && (
                            <div className="flex gap-3 animate-pulse opacity-50">
                                <div className="shrink-0 w-8 h-8 rounded-xl bg-foreground/[0.03] border border-border/10" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-2 bg-foreground/[0.05] rounded w-1/4" />
                                    <div className="h-4 bg-foreground/[0.03] rounded w-3/4" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Preview attachment */}
                    {imagePreview && (
                        <div className="px-4 pb-2">
                            <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-surface-elevated border border-border/10 shadow-lg">
                                <img src={imagePreview} className="w-10 h-10 rounded-lg object-cover" alt="Attachment" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary px-1">Attached</span>
                                <button onClick={() => setImagePreview(null)} className="p-1 rounded-lg hover:bg-danger/10 hover:text-danger transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="shrink-0 border-t border-white/5 bg-surface/80 px-3 py-3">
                        {input && detectedBadge && (
                            <div className="mb-2 flex items-center">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-accent/60 bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {detectedBadge} detected
                                </span>
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            <div className="flex shrink-0 pb-0.5">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="p-2 rounded-xl bg-foreground/[0.03] border border-border/15 text-text-tertiary hover:text-accent transition-all"
                                    title="Attach image"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleInput}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    placeholder={mode === 'support' ? "Ask about Aletheia..." : "Analyze selected case logs..."}
                                    className="w-full bg-foreground/[0.02] border border-border/15 focus:border-accent/40 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary/50 outline-none resize-none transition-all leading-relaxed"
                                    style={{ maxHeight: '100px' }}
                                    disabled={sending}
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={sending || (!input.trim() && !imagePreview)}
                                className={`shrink-0 p-2.5 rounded-xl transition-all active:scale-95 mb-0.5 ${
                                    sending || (!input.trim() && !imagePreview)
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-accent text-white shadow-glow-cyan-sm'
                                }`}
                            >
                                {sending
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Send className="w-3.5 h-3.5" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pulsing circular chat trigger bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-90 shadow-glow-cyan ${
                    isOpen 
                        ? 'bg-danger border-danger/30 text-white hover:bg-danger-hover' 
                        : 'bg-accent border-accent/20 text-white hover:bg-accent-hover'
                }`}
                title="AI Threat Co-Pilot"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
            </button>
        </div>
    );
}
