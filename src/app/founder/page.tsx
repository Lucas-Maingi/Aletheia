"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FounderPage() {
    useEffect(() => {
        document.title = "Founder & Vision — Aletheia";
    }, []);

    return (
        <main className="min-h-screen bg-background relative selection:bg-accent/30 selection:text-accent flex flex-col items-center pt-24 pb-32 overflow-hidden">
            {/* Minimal Background Glare */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-accent/[0.05] blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl w-full px-6 md:px-12 relative z-10 space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-accent transition-colors self-start mb-8 border border-border/10 rounded-full px-4 py-1.5 hover:border-accent/30 bg-surface/30 backdrop-blur-md">
                        <ArrowLeft className="w-3.5 h-3.5" /> Return to Terminal
                    </Link>
                    
                    <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 font-mono text-[10px] tracking-widest px-3 py-1">
                        DECLASSIFIED
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-primary">
                        Vision & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500">Transparency</span>
                    </h1>
                </div>

                {/* Founder Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-blue-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative bg-surface/40 backdrop-blur-3xl border border-border/20 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
                        
                        <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-center">
                            {/* Profile Column */}
                            <div className="flex flex-col items-center md:items-start space-y-6">
                                <div className="w-48 h-48 rounded-2xl border border-border/20 shadow-2xl overflow-hidden bg-background/50 relative p-1 group-hover:border-accent/40 transition-colors duration-500">
                                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                                    <div className="w-full h-full bg-foreground/[0.05] rounded-xl flex items-center justify-center relative overflow-hidden">
                                        <Shield className="w-16 h-16 text-text-tertiary opacity-30" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left space-y-1">
                                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-wider">Lucas Maingi</h2>
                                    <p className="text-xs font-mono text-accent uppercase tracking-widest">Creator, Aletheia</p>
                                </div>
                                
                                <a 
                                    href="https://www.linkedin.com/in/lucas-maingi/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-accent text-white px-6 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center"
                                >
                                    View LinkedIn <ArrowUpRight className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Content Column */}
                            <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
                                <p className="first-letter:text-4xl first-letter:font-black first-letter:text-accent first-letter:mr-1 first-letter:float-left">
                                    Aletheia was born out of a stark realization: the asymmetry of information in the modern digital landscape heavily favors threat actors. The tools required to investigate, synthesize, and defend against targeted harassment, fraud, and espionage were traditionally locked behind massive corporate contracts or scattered across fragmented, opaque networks.
                                </p>
                                <p>
                                    As the creator of Aletheia, my mission is to democratize elite-grade Open Source Intelligence (OSINT). By fusing high-fidelity public data streams with deterministic AI orchestration, Aletheia allows investigators, journalists, and security analysts to surface the truth in seconds, not weeks.
                                </p>
                                <p className="font-medium text-text-primary border-l-2 border-accent/50 pl-4 py-2 bg-accent/[0.02]">
                                    "Privacy and security are not mutually exclusive. Aletheia operates strictly on publicly accessible data, ensuring compliance and ethical boundary adherence while providing unparalleled visibility."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Tenets */}
                <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-border/10">
                    <div className="space-y-4 p-6 bg-surface/20 rounded-2xl border border-border/5">
                        <Eye className="w-8 h-8 text-accent" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Radical Transparency</h3>
                        <p className="text-xs text-text-tertiary leading-relaxed">We don't obfuscate our methods. Every piece of evidence is hashed and securely logged for chain-of-custody verification.</p>
                    </div>
                    <div className="space-y-4 p-6 bg-surface/20 rounded-2xl border border-border/5">
                        <Shield className="w-8 h-8 text-blue-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Defensive Posture</h3>
                        <p className="text-xs text-text-tertiary leading-relaxed">Built for defense. Aletheia strictly forbids targeting protected individuals and mandates ethical use policies.</p>
                    </div>
                    <div className="space-y-4 p-6 bg-surface/20 rounded-2xl border border-border/5">
                        <Lock className="w-8 h-8 text-indigo-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Zero-Trust Privacy</h3>
                        <p className="text-xs text-text-tertiary leading-relaxed">Your investigations remain yours. Aletheia does not train its core models on your proprietary queries.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
