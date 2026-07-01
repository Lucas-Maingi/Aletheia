"use client";

import { useEffect } from "react";
import { CheckCircle2, Circle, Rocket, Globe2, ShieldAlert, Cpu, Sparkles, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RoadmapPage() {
    useEffect(() => {
        document.title = "Scaling Roadmap — Aletheia";
    }, []);

    const phases = [
        {
            title: "Phase 1: Foundation",
            timeline: "Current (Early 2026)",
            status: "active",
            connectors: "~15 Core Connectors",
            description: "Establishing the base intelligence framework with high-fidelity public data sources.",
            icon: <Cpu className="w-6 h-6 text-accent" />,
            features: [
                "Identity Graph Synthesis",
                "Reverse Image Search & Exif Analysis",
                "Breach & Leak Indexing",
                "Social Media Mapping"
            ]
        },
        {
            title: "Phase 2: The Deep Web Expansion",
            timeline: "End of 2026",
            status: "pending",
            connectors: "Target: 200+ Connectors",
            description: "Scaling horizontally into specialized databases, dark web indexers, and corporate registries.",
            icon: <Globe2 className="w-6 h-6 text-purple-400" />,
            features: [
                "International Corporate Registries (EU, APAC)",
                "IoT Search Engines (Shodan, Censys)",
                "Cryptocurrency Wallet Traceability",
                "Dark Web Forum Scraping",
                "SIEM/SOAR Advanced Piping"
            ]
        },
        {
            title: "Phase 3: Global Dominance",
            timeline: "Mid 2027",
            status: "future",
            connectors: "Target: 700 - 1000 Connectors",
            description: "Hyper-niche regional databases and automated AI-driven scraper generation.",
            icon: <Rocket className="w-6 h-6 text-pink-400" />,
            features: [
                "Automated zero-day scraper generation via LLMs",
                "Local municipal & court record parsing",
                "Satellite imagery delta detection",
                "Predictive threat modeling",
                "Decentralized intelligence sharing nodes"
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-accent" />
                    <h1 className="text-3xl font-black uppercase tracking-widest text-text-primary">
                        Connector Scaling Roadmap
                    </h1>
                </div>
                <p className="text-text-secondary leading-relaxed max-w-2xl text-sm">
                    Aletheia's strength lies in its breadth of data. This roadmap outlines our aggressive expansion 
                    strategy to integrate over 1,000 distinct OSINT data sources by 2027, transforming Aletheia into 
                    the most comprehensive intelligence engine on the market.
                </p>
            </header>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/20 before:to-transparent">
                {phases.map((phase, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon Node */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-500 group-hover:scale-110">
                            {phase.status === 'active' ? (
                                <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
                            ) : null}
                            <div className="relative z-10 w-full h-full flex items-center justify-center bg-background rounded-full">
                                {phase.status === 'active' ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <Circle className="w-5 h-5 text-border/40" />}
                            </div>
                        </div>

                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                            <Card className={`bg-surface border ${phase.status === 'active' ? 'border-accent/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'border-border/10'} rounded-3xl overflow-hidden hover:border-accent/50 transition-colors duration-500`}>
                                <CardHeader className="bg-foreground/[0.02] border-b border-border/5 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-background rounded-2xl border border-border/5 shadow-inner">
                                            {phase.icon}
                                        </div>
                                        <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest ${phase.status === 'active' ? 'text-accent border-accent/20' : 'text-text-tertiary border-border/10'}`}>
                                            {phase.timeline}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase tracking-wider text-text-primary">
                                        {phase.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm font-medium text-text-secondary mt-2">
                                        {phase.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border/10">
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                        <span className="text-xs font-bold text-text-primary">{phase.connectors}</span>
                                    </div>
                                    <ul className="space-y-2 mt-4">
                                        {phase.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-text-tertiary">
                                                <div className="w-1.5 h-1.5 rounded-full bg-border/40 mt-1 shrink-0" />
                                                <span className="leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
