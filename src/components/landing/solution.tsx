"use client";

import { Shield, Zap, Search, Database, FileText, Share2, Globe } from "lucide-react";

const features = [
    {
        title: "Automated Search Orchestration",
        description: "One-click execution of multifaceted searches across public sources and databases.",
        icon: <Search className="w-5 h-5 text-accent" />
    },
    {
        title: "Username Reuse Detection",
        description: "AI-driven handle correlation to map identities across disparate platforms automatically.",
        icon: <Share2 className="w-5 h-5 text-accent" />
    },
    {
        title: "Reverse Image Workflow",
        description: "Integrated reverse image lookup without leaving the investigation workspace.",
        icon: <Globe className="w-5 h-5 text-accent" />
    },
    {
        title: "Evidence Locker",
        description: "Centrally store and tag intelligence evidence with automatic source tracking.",
        icon: <Database className="w-5 h-5 text-accent" />
    },
    {
        title: "AI-Assisted Reporting",
        description: "Generate structured, professional intelligence reports in seconds.",
        icon: <FileText className="w-5 h-5 text-accent" />
    },
    {
        title: "Structured Exports",
        description: "Export finding in high-fidelity formats ready for professional delivery.",
        icon: <Shield className="w-5 h-5 text-accent" />
    }
];

export function Solution() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent mb-6">
                            <Zap className="w-3 h-3" />
                            Force Multiplier
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                            One Structured <br />
                            <span className="text-accent underline decoration-accent/20 underline-offset-8">Intelligence Workspace</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                            {features.map((feature, index) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {feature.icon}
                                        <h3 className="font-bold">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 shadow-glow overflow-hidden">
                            <div className="rounded-xl bg-background border border-border p-6 shadow-panel">
                                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-error" />
                                        <div className="w-2 h-2 rounded-full bg-warning" />
                                        <div className="w-2 h-2 rounded-full bg-success" />
                                        <span className="ml-4 text-[10px] font-mono text-text-muted">ALETHEIA_TERMINAL_V1.0</span>
                                    </div>
                                    <Shield className="w-4 h-4 text-text-muted" />
                                </div>
                                <div className="space-y-4 font-mono text-xs opacity-80">
                                    <div className="text-accent">$ python aletheia.py --target "jdoe_admin"</div>
                                    <div className="text-text-secondary">[INFO] Scanning 140+ social platforms...</div>
                                    <div className="text-text-secondary">[INFO] Searching 8.2B breach records...</div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                                            <div className="h-full bg-accent w-3/4 animate-pulse" />
                                        </div>
                                        <span className="text-[10px]">75%</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className="p-2 border border-border rounded bg-surface">
                                            <div className="text-[10px] text-text-muted mb-1">Found Leads</div>
                                            <div className="text-lg font-bold">12</div>
                                        </div>
                                        <div className="p-2 border border-border rounded bg-surface">
                                            <div className="text-[10px] text-text-muted mb-1">Confidence</div>
                                            <div className="text-lg font-bold text-success">HIGH</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
