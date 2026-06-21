"use client";

import { AletheiaLogo } from "@/components/AletheiaLogo";
import { ChatEvidenceGrid } from "@/components/dashboard/chat-evidence-card";
import { User, Bot, ImageIcon, Loader2, Sparkles, Files, Zap } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ChatMessageData {
    id: string;
    role: 'user' | 'agent';
    content: string;
    imageUrl?: string;
    detectedType?: string;
    evidence?: any[];
    evidenceCount?: number;
    status?: 'sending' | 'scanning' | 'complete' | 'error';
    investigationId?: string;
    timestamp: Date;
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isUser
                    ? 'bg-accent/10 border border-accent/20 shadow-sm'
                    : 'bg-foreground/[0.03] border border-border/10 shadow-sm'
                }`}>
                {isUser
                    ? <User className="w-4 h-4 text-accent" />
                    : <AletheiaLogo className="w-4 h-4 text-accent" />
                }
            </div>

            {/* Bubble */}
            <div className={`flex-1 max-w-[85%] md:max-w-[70%] ${isUser ? 'flex flex-col items-end' : ''}`}>
                {/* Role Label */}
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 block ${isUser ? 'text-accent/80 text-right' : 'text-text-tertiary'}`}>
                    {isUser ? 'Tactical_Input' : 'AI_Subsystem'}
                    <span className="text-text-tertiary/40 ml-2 font-bold font-mono">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </span>

                <div className={`rounded-2xl px-5 py-4 ${isUser
                        ? 'bg-accent/10 border border-accent/20 rounded-tr-md shadow-glow-cyan-sm'
                        : 'bg-surface-elevated/30 border-border/10 rounded-tl-md shadow-sm'
                    }`}>

                    {/* User Image Preview */}
                    {message.imageUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-border/10 inline-block shadow-xl">
                            <img src={message.imageUrl} alt="Submitted" className="max-w-full md:max-w-[400px] max-h-[300px] object-cover" />
                        </div>
                    )}

                    {/* Type Detection Badge */}
                    {message.detectedType && isUser && (
                        <div className="mb-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-[9px] font-black text-accent uppercase tracking-[0.2em]">
                            <Bot className="w-2.5 h-2.5" />
                            {message.detectedType.replace('_', ' ')} detected
                        </div>
                    )}

                    {/* Text Content / Markdown Findings */}
                    {message.content && (
                        <div className={`text-sm leading-relaxed ${isUser ? 'text-text-primary/95 whitespace-pre-wrap font-medium' : ''}`}>
                            {isUser ? (
                                message.content
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-text-primary prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-[11px] prose-p:text-text-secondary prose-strong:text-accent prose-code:text-accent prose-code:bg-foreground/[0.05] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none border-l-2 border-accent/20 pl-4 py-1">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ href, children }) => {
                                                if (href && href.startsWith('sandbox-pivot:')) {
                                                    const target = href.replace('sandbox-pivot:', '');
                                                    return (
                                                        <button
                                                            onClick={() => (window as any).pivotTo?.(target)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded-md bg-accent/20 border border-accent/30 text-[10px] font-black text-accent uppercase tracking-widest hover:bg-accent/30 transition-all hover:scale-105 active:scale-95 ml-1 mr-1"
                                                        >
                                                            <Zap className="w-3 h-3 text-accent animate-pulse" />
                                                            Deploy Sweep: {target}
                                                        </button>
                                                    );
                                                }
                                                return <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{children}</a>;
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scanning Status */}
                    {message.status === 'scanning' && (
                        <div className="flex items-center gap-3 mt-4 text-accent text-[10px] font-black uppercase tracking-[0.2em] bg-accent/5 p-3 rounded-xl border border-accent/20">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="animate-pulse">
                                Tactical Sweep Active
                                {message.evidenceCount ? ` — ${message.evidenceCount} leads cached` : '…'}
                            </span>
                        </div>
                    )}

                    {/* Evidence Results */}
                    {message.evidence && message.evidence.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border/10 space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-text-tertiary/40">
                                <Files className="w-3 h-3 text-accent/60" />
                                Intelligence_Artifacts
                            </div>
                            <ChatEvidenceGrid evidence={message.evidence} />
                        </div>
                    )}

                    {/* Error State */}
                    {message.status === 'error' && (
                        <div className="flex items-center gap-3 mt-4 text-danger dark:text-red-400 text-[10px] font-black uppercase tracking-widest bg-danger/5 p-3 rounded-xl border border-danger/20">
                            <span>⚠ Node link loss detected. Retry sequence required.</span>
                        </div>
                    )}

                    {/* Completed State - Logic moved to results display */}
                </div>
            </div>
        </div>
    );
}
