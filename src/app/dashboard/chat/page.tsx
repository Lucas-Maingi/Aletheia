"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Send, ImageIcon, Loader2, Camera, X,
    Sparkles, MessageSquare, Layers, Bot
} from "lucide-react";
import { ChatMessage, ChatMessageData } from "@/components/dashboard/chat-message";

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
        content: `Welcome to Aletheia Customer Support & Product Guide.\n\nAsk me anything about the platform, such as:\n• How does the Target Sweep work?\n• What are Watchlists and how do I set them up?\n• Tell me about the lifetime billing tiers.\n• How do I use the Vehicle Registry or LPR scanner?\n• Where can I configure my API keys?`,
        status: 'complete' as const,
        timestamp: new Date(),
    },
    copilot: {
        id: 'welcome',
        role: 'agent' as const,
        content: `Case Co-Pilot Subsystem Initialized.\n\nSelect one or more active investigation files in the sidebar, then ask me to:\n• Look for connections or overlaps across the cases.\n• Analyze specific breach logs or domains.\n• Recommend next pivot targets.\n• Draft a cross-case threat summary.`,
        status: 'complete' as const,
        timestamp: new Date(),
    }
};

export default function ChatPage() {
    const [mode, setMode] = useState<'support' | 'copilot'>('support');
    const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME_MESSAGES.support]);
    const [input, setInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [detectedBadge, setDetectedBadge] = useState<string | null>(null);
    const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [allInvestigations, setAllInvestigations] = useState<any[]>([]);
    const [selectedInvestigationIds, setSelectedInvestigationIds] = useState<string[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Mode-specific Welcome Message Swap
    useEffect(() => {
        if (messages.length === 1 && messages[0].id === 'welcome') {
            setMessages([WELCOME_MESSAGES[mode]]);
        }
    }, [mode]);

    // Pivot Handler for Chat Messages
    useEffect(() => {
        (window as any).pivotTo = (target: string) => {
            setInput(target);
            setTimeout(() => handleSend(), 100);
        };
        return () => { delete (window as any).pivotTo; };
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    // Auto-detect input type
    useEffect(() => {
        setDetectedBadge(detectType(input));
    }, [input]);

    // Auto-resize textarea
    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch('/api/investigations');
            if (!res.ok) return;
            const data = await res.json();
            // Filter for chat investigations
            const chatOnly = data.filter((i: any) => i.description?.includes('Chat'));
            setChatHistory(chatOnly);
        } catch (e) {
            console.error('[Chat] Failed to fetch history:', e);
        }
    }, []);

    const fetchAllInvestigations = useCallback(async () => {
        try {
            const res = await fetch('/api/investigations');
            if (!res.ok) return;
            const data = await res.json();
            setAllInvestigations(data);
        } catch (e) {
            console.error('[Chat] Failed to fetch all investigations:', e);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        fetchAllInvestigations();
    }, [fetchHistory, fetchAllInvestigations]);

    const loadPastInvestigation = async (id: string) => {
        if (id === activeInvestigationId) return;
        setSending(true);
        try {
            const res = await fetch(`/api/investigations/${id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            // Reconstruct messages for the UI
            const newMessages: ChatMessageData[] = [
                WELCOME_MESSAGES.support,
                {
                    id: 'past-query',
                    role: 'user',
                    content: data.title.replace('Chat: ', ''),
                    timestamp: new Date(data.createdAt),
                },
                {
                    id: 'past-result',
                    role: 'agent',
                    content: data.reports?.[0]?.content || "Investigation data retrieved.",
                    evidence: data.evidence || [],
                    investigationId: id,
                    status: 'complete',
                    timestamp: new Date(data.updatedAt),
                }
            ];
            
            setMessages(newMessages);
            setActiveInvestigationId(id);
            setMode('support'); // Swap back to support when loading general chat
        } catch (e) {
            console.error('[Chat] Load failed:', e);
        } finally {
            setSending(false);
        }
    };

    const pollForEvidence = useCallback(async (investigationId: string, agentMsgId: string) => {
        let attempts = 0;
        const maxAttempts = 60; // ~3 minutes
        let lastCount = 0;
        let foundReport = false;

        const poll = async () => {
            if (attempts >= maxAttempts || foundReport) {
                setMessages(prev => prev.map(m =>
                    m.id === agentMsgId ? { ...m, status: 'complete' as const } : m
                ));
                fetchHistory(); // Refresh history list
                return;
            }
            attempts++;

            try {
                const res = await fetch(`/api/investigations/${investigationId}`);
                if (!res.ok) throw new Error();
                const data = await res.json();

                const evidence = data.evidence || [];
                const reports = data.reports || [];
                const status = data.status;

                if (reports.length > 0) {
                    foundReport = true;
                    setMessages(prev => prev.map(m =>
                        m.id === agentMsgId ? {
                            ...m,
                            content: reports[0].content,
                            evidence: evidence,
                            status: 'complete' as const,
                            investigationId: investigationId,
                        } : m
                    ));
                    fetchHistory();
                    return;
                }

                if (evidence.length !== lastCount || status === 'closed') {
                    console.log(`[Chat] Evidence sync: ${evidence.length} items found (Status: ${status})`);
                    lastCount = evidence.length;
                    setMessages(prev => prev.map(m =>
                        m.id === agentMsgId ? {
                            ...m,
                            evidence: evidence.slice(0, 20),
                            evidenceCount: evidence.length,
                            status: status === 'closed' ? 'complete' as const : 'scanning' as const,
                            content: status === 'closed'
                                ? `Scan complete. Found ${evidence.length} intelligence items across internal and external data feeds. I'm ready to discuss these findings with you.`
                                : `Intelligence gathering in progress. Found ${evidence.length} items so far. Maintaining persistent agent link...`,
                        } : m
                    ));
                }

                if (status !== 'closed' && !foundReport) {
                    setTimeout(poll, 3000);
                }
            } catch {
                setTimeout(poll, 3000);
            }
        };

        setTimeout(poll, 2000);
    }, [fetchHistory]);

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
        const isConversationalMode = mode === 'support' || mode === 'copilot';
        const agentMsg: ChatMessageData = {
            id: agentMsgId,
            role: 'agent',
            content: mode === 'support'
                ? 'Searching documentation...'
                : (mode === 'copilot' ? 'Analyzing case intelligence...' : (activeInvestigationId ? 'Analyzing evidence…' : 'Deploying intelligence agents…')),
            status: isConversationalMode ? undefined : (activeInvestigationId ? undefined : 'scanning'),
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
                    investigationId: activeInvestigationId || undefined,
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
                    investigationId: data.investigationId || activeInvestigationId || undefined,
                    status: data.status || 'complete'
                } : m
            ));

            if (data.investigationId && !activeInvestigationId && !isConversationalMode) {
                setActiveInvestigationId(data.investigationId);
                
                const geminiKey2 = typeof window !== 'undefined'
                    ? localStorage.getItem('openvector_gemini_key') : null;
                const scanHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
                if (geminiKey2) scanHeaders['x-gemini-key'] = geminiKey2;
                
                fetch(`/api/investigations/${data.investigationId}/scan`, {
                    method: 'POST',
                    headers: scanHeaders,
                }).then(scanRes => {
                    if (scanRes.ok) {
                        console.log('[Chat] Scan completed successfully');
                    } else {
                        console.error('[Chat] Scan failed:', scanRes.status);
                    }
                }).catch(err => {
                    console.error('[Chat] Scan network error:', err);
                });

                pollForEvidence(data.investigationId, agentMsgId);
            }
        } catch (err: any) {
            setMessages(prev => prev.map(m =>
                m.id === agentMsgId ? {
                    ...m,
                    content: `Node synchronization interrupted: ${err.message}. Please try again.`,
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
        <div className="flex h-full -m-8 -mb-0 overflow-hidden">
            {/* Sidebar - History or Case Selector */}
            <aside className="w-80 border-r border-border/10 bg-surface/50 backdrop-blur-xl flex flex-col hidden xl:flex">
                <div className="p-6 border-b border-border/10">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary mb-1">
                        {mode === 'copilot' ? 'Case_Correlation' : 'Intelligence_Log'}
                    </h2>
                    <p className="text-xs text-text-secondary font-medium uppercase tracking-tight">
                        {mode === 'copilot' ? 'Select Cases to Correlate' : 'Previous Conversations'}
                    </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {mode === 'copilot' ? (
                        allInvestigations.length === 0 ? (
                            <div className="p-8 text-center space-y-3 opacity-20">
                                <Layers className="w-8 h-8 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No active case files found.</p>
                            </div>
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
                                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 ${
                                            isChecked 
                                                ? 'bg-accent/15 border-accent/40 text-accent shadow-glow-cyan-sm' 
                                                : 'bg-surface-elevated/20 border-border/10 text-text-secondary hover:bg-surface-elevated/40 hover:border-border/30 hover:text-text-primary'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {}} // handled by parent div click
                                            className="mt-1 h-3.5 w-3.5 rounded border-border/40 text-accent focus:ring-accent bg-background/50 accent-accent"
                                        />
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[11px] font-black uppercase tracking-wider truncate mb-1">
                                                {item.title}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-mono text-text-tertiary/60 font-bold uppercase tracking-tighter">
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{item._count?.evidence || 0} findings</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        chatHistory.length === 0 ? (
                            <div className="p-8 text-center space-y-3 opacity-20">
                                <Layers className="w-8 h-8 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No tactical data found in local nodes.</p>
                            </div>
                        ) : (
                            chatHistory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadPastInvestigation(item.id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                                        activeInvestigationId === item.id 
                                            ? 'bg-accent/10 border-accent/30 text-accent shadow-glow-cyan-sm' 
                                            : 'bg-surface-elevated/20 border-border/10 text-text-secondary hover:bg-surface-elevated/40 hover:border-border/30 hover:text-text-primary'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-1.5 rounded-lg border transition-colors ${
                                            activeInvestigationId === item.id ? 'bg-accent/20 border-accent/20' : 'bg-foreground/[0.03] border-border/10 group-hover:bg-foreground/[0.05]'
                                        }`}>
                                            <Bot className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[11px] font-black uppercase tracking-wider truncate mb-1">
                                                {item.title.replace('Chat: ', '')}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-mono text-text-tertiary/60 font-bold uppercase tracking-tighter">
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{item._count?.evidence || 0} findings</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-foreground/[0.02]">
                    {mode === 'copilot' ? (
                        <div className="text-center text-[10px] font-mono text-text-tertiary/80 uppercase tracking-widest leading-relaxed">
                            {selectedInvestigationIds.length} Cases Selected For Analysis
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                setMessages([WELCOME_MESSAGES.support]);
                                setActiveInvestigationId(null);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-black text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all shadow-glow-cyan-sm active:scale-95"
                        >
                            New Intelligence Scan
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="shrink-0 border-b border-border/10 bg-surface/80 backdrop-blur-xl px-4 md:px-6 py-3 flex items-center justify-between gap-3 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                            <MessageSquare className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-text-primary tracking-tight uppercase">AI Assistant</h1>
                            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-[0.2em] leading-none mt-0.5">Autonomous Intelligence Subsystem</p>
                        </div>
                    </div>
                    
                    {/* Cyberpunk Segmented Control */}
                    <div className="flex items-center bg-foreground/[0.03] border border-border/10 rounded-xl p-0.5 gap-0.5 shadow-inner">
                        <button
                            onClick={() => setMode('support')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                mode === 'support'
                                    ? 'bg-accent text-accent-foreground shadow-glow-cyan-sm'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                            }`}
                        >
                            General Support
                        </button>
                        <button
                            onClick={() => {
                                setMode('copilot');
                                fetchAllInvestigations();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                mode === 'copilot'
                                    ? 'bg-accent text-accent-foreground shadow-glow-cyan-sm'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                            }`}
                        >
                            Case Co-Pilot
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400/70 font-black uppercase tracking-widest hidden md:inline">Neural Link Active</span>
                    </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth no-scrollbar">
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

                {/* Image Preview */}
                {imagePreview && (
                    <div className="px-4 md:px-8 pb-2">
                        <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border/10 shadow-lg">
                            <img src={imagePreview} className="w-12 h-12 rounded-lg object-cover" alt="Upload" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary px-2">Image attached</span>
                            <button onClick={() => setImagePreview(null)} className="p-1.5 rounded-lg hover:bg-danger/10 hover:text-danger transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Bar */}
                <div className="shrink-0 border-t border-white/5 bg-surface/80 backdrop-blur-xl px-3 md:px-6 py-3 safe-area-bottom">
                    <div className="max-w-3xl mx-auto">
                        {/* Detection Badge */}
                        {input && detectedBadge && (
                            <div className="mb-2 flex items-center">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-accent/60 bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {detectedBadge} detected
                                </span>
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            {/* Camera / Upload */}
                            <div className="flex gap-1.5 shrink-0 pb-1">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="p-2.5 rounded-xl bg-foreground/[0.03] border border-border/15 text-text-tertiary hover:text-accent hover:border-accent/30 transition-all active:scale-95"
                                    title="Upload Image"
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

                            {/* Text Input */}
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleInput}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    placeholder={mode === 'support' ? "Ask about Aletheia features, settings, or pricing..." : "Ask Co-Pilot to analyze or correlate active case intelligence..."}
                                    className="w-full bg-foreground/[0.02] border border-border/15 focus:border-accent/40 rounded-2xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/50 outline-none resize-none transition-all leading-relaxed shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
                                    style={{ maxHeight: '120px' }}
                                    disabled={sending}
                                />
                            </div>

                            {/* Send */}
                            <button
                                onClick={handleSend}
                                disabled={sending || (!input.trim() && !imagePreview)}
                                className={`shrink-0 p-3 rounded-xl transition-all active:scale-95 mb-0.5 ${
                                    sending || (!input.trim() && !imagePreview)
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-accent text-white shadow-glow-cyan-sm hover:shadow-glow-cyan'
                                }`}
                            >
                                {sending
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Send className="w-4 h-4" />
                                }
                            </button>
                        </div>

                        <p className="text-center text-[9px] text-text-tertiary/40 mt-3 font-black uppercase tracking-[0.2em] hidden md:block">
                            Shift+Enter for newline · Real-time identity graph active
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
