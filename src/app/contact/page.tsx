"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Mail, MessageSquare, Send, CheckCircle2, ShieldAlert, LifeBuoy, Zap, 
    ArrowRight, Loader2, Sparkles
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/footer";
import { ContentBackButton } from "@/components/landing/content-back-button";


export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("general");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate secure telemetry uplink dispatch
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const contactChannels = [
        {
            title: "Technical Support",
            desc: "Active operational assistance, bug reporting, and account queries.",
            email: "support@aletheia.io",
            icon: LifeBuoy,
            color: "text-accent",
            glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-accent/5 border-accent/20"
        },
        {
            title: "Ethics & Compliance",
            desc: "Reports regarding platform misuse, stalking violations, or compliance guidelines.",
            email: "ethics@aletheia.io",
            icon: ShieldAlert,
            color: "text-purple-400",
            glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-purple-500/5 border-purple-500/20"
        },
        {
            title: "General Inquiries",
            desc: "Press queries, partnership proposals, and founding slot availability.",
            email: "contact@aletheia.io",
            icon: MessageSquare,
            color: "text-emerald-400",
            glow: "shadow-[0_0_15px_rgba(52,211,153,0.15)] bg-emerald-500/5 border-emerald-500/20"
        }
    ];

    return (
        <div className="w-full bg-background min-h-screen flex flex-col overflow-x-hidden">
            <LandingHeader />

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 blur-[180px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-40 right-10 w-[400px] h-[400px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            <main className="flex-1 max-w-6xl mx-auto px-6 pt-32 pb-24 w-full relative z-10">
                <ContentBackButton />
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-accent/30 text-accent text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5" /> Secure Uplink Channel
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight leading-none">
                        Establish <span className="text-accent">Contact</span>
                    </h1>
                    <p className="text-text-secondary text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                        Dispatch encrypted telemetry payloads directly to the Aletheia Command Center. Select your destination channel below.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Contact Channels */}
                    <div className="lg:col-span-5 space-y-6">
                        <h2 className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.3em] pl-1">
                            Direct Routing Channels
                        </h2>
                        
                        <div className="space-y-4">
                            {contactChannels.map((channel, i) => {
                                const Icon = channel.icon;
                                return (
                                    <div 
                                        key={i}
                                        className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${channel.glow}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-xl bg-background border border-border/10 ${channel.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                                    {channel.title}
                                                </h3>
                                                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                                                    {channel.desc}
                                                </p>
                                                <div className="pt-2">
                                                    <a 
                                                        href={`mailto:${channel.email}`}
                                                        className={`text-xs font-mono font-bold hover:underline underline-offset-4 ${channel.color}`}
                                                    >
                                                        {channel.email}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Encrypted Form */}
                    <div className="lg:col-span-7">
                        <div className="relative p-8 md:p-10 rounded-3xl bg-surface/40 border border-border/10 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] overflow-hidden group">
                            {/* Decorative Top Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/80 to-transparent opacity-50" />
                            
                            <AnimatePresence mode="wait">
                                {!isSuccess ? (
                                    <motion.div
                                        key="contact-form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-1.5">
                                            <h2 className="text-lg font-black text-white uppercase italic tracking-tight">
                                                Encrypted Payload Dispatch
                                            </h2>
                                            <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">
                                                System_Lockout: Zero-Logs Policy Active
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block">
                                                        Sender Name
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        required
                                                        placeholder="Agent Name"
                                                        className="w-full bg-background/50 border border-border/20 focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/30 outline-none font-bold transition-all focus:ring-1 focus:ring-accent/25"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block">
                                                        Uplink Address (Email)
                                                    </label>
                                                    <input 
                                                        type="email"
                                                        required
                                                        placeholder="agent@domain.com"
                                                        className="w-full bg-background/50 border border-border/20 focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/30 outline-none font-bold transition-all focus:ring-1 focus:ring-accent/25"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block">
                                                    Target Routing Area
                                                </label>
                                                <select 
                                                    className="w-full bg-background/50 border border-border/20 focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-text-primary outline-none font-bold transition-all focus:ring-1 focus:ring-accent/25"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                >
                                                    <option value="general" className="bg-surface text-text-primary font-bold">General Command Inquiries</option>
                                                    <option value="support" className="bg-surface text-text-primary font-bold">Technical Operations Support</option>
                                                    <option value="abuse" className="bg-surface text-text-primary font-bold">Abuse &amp; Ethics Violation Report</option>
                                                    <option value="billing" className="bg-surface text-text-primary font-bold">Founding Deal Slots / Billing</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block">
                                                    Payload Content (Message)
                                                </label>
                                                <textarea 
                                                    required
                                                    rows={5}
                                                    placeholder="Specify your telemetry briefing here..."
                                                    className="w-full bg-background/50 border border-border/20 focus:border-accent/40 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/30 outline-none font-bold transition-all focus:ring-1 focus:ring-accent/25 resize-none"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-14 bg-accent hover:bg-white hover:text-accent text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-accent/15 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Syncing Uplink...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4" />
                                                        <span>Dispatch Secure Telemetry</span>
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success-message"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8 space-y-6"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent mx-auto shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                                                Payload Dispatched Successfully
                                            </h3>
                                            <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">
                                                Packet_ID: {Math.random().toString(36).substring(2, 10).toUpperCase()} • Sync_Confirmed
                                            </p>
                                        </div>

                                        <div className="max-w-md mx-auto p-5 rounded-2xl bg-background/50 border border-border/10 text-left font-mono text-[10px] text-text-secondary leading-relaxed space-y-2">
                                            <div className="text-accent font-black uppercase">Routing telemetry logs:</div>
                                            <div>↳ Status: <span className="text-emerald-400 font-bold">DISPATCHED</span></div>
                                            <div>↳ Origin: <span className="text-white">{email}</span></div>
                                            <div>↳ Operator: <span className="text-white">{name}</span></div>
                                            <div>↳ Target Area: <span className="text-white">{subject.toUpperCase()}</span></div>
                                            <div className="pt-2 border-t border-border/5 text-[9px] text-text-tertiary">
                                                Aletheia Intelligence officers will decrypt this packet and establish communications within 12 standard cycles (hours).
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setIsSuccess(false);
                                                setName("");
                                                setEmail("");
                                                setMessage("");
                                            }}
                                            className="inline-flex items-center gap-2 px-6 py-3 border border-border/20 rounded-xl hover:border-accent/40 text-text-secondary hover:text-text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Reset Secure Uplink <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
