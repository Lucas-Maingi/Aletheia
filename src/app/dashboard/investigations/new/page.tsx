"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Search, Mail, AtSign, Phone, Globe,
    Loader2, AlertCircle, ImageIcon, X,
    ArrowRight, Scan, User, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewInvestigationPage() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [omniValue, setOmniValue] = useState("");
    const [detectedType, setDetectedType] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        const target = searchParams.get('target');
        const autostart = searchParams.get('autostart');
        
        // Check for pending image from landing page/command palette
        const pendingImage = sessionStorage.getItem('aletheia_pending_image');
        if (pendingImage) {
            setImagePreview(pendingImage);
            sessionStorage.removeItem('aletheia_pending_image');
        }

        if (target || pendingImage) {
            if (target) {
                setOmniValue(target);
                setDetectedType(detectType(target));
            }
            
            // Seamless auto-start if specifically requested (e.g., from landing page or dashboard)
            if (autostart === 'true') {
                setTimeout(() => {
                    formRef.current?.requestSubmit();
                }, 100);
            }
        }
    }, [searchParams, formRef]);

    const detectType = (val: string) => {
        const v = val.trim();
        if (!v) return null;
        if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/.test(v)) return 'Crypto Address';
        if (/^0x[a-fA-F0-9]{40}$/i.test(v)) return 'ETH Wallet';
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email';
        if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) return 'Domain';
        if (/^\+?[0-9\s-]{8,}$/.test(v)) return 'Phone';
        if (v.includes(" ")) return 'Full Name';
        return 'Username';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check for Vercel 4.5MB payload limit (base64 adds ~33% overhead)
            // 3.5MB * 1.33 = 4.6MB
            if (file.size > 3.5 * 1024 * 1024) {
                setError("Image is too large (max 3.5MB). Please compress it or use a lower resolution.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target?.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        let subjectName = formData.get("subjectName") as string;
        let subjectUsername = formData.get("subjectUsername") as string;
        let subjectEmail = formData.get("subjectEmail") as string;
        let subjectDomain = formData.get("subjectDomain") as string;
        let subjectPhone = formData.get("subjectPhone") as string;

        if (omniValue) {
            const parts = omniValue.split(',').map(p => p.trim()).filter(Boolean);
            parts.forEach(part => {
                const type = detectType(part);
                if (type === 'Email' && !subjectEmail) subjectEmail = part;
                else if ((type === 'Crypto Address' || type === 'ETH Wallet' || type === 'Username') && !subjectUsername) subjectUsername = part;
                else if (type === 'Domain' && !subjectDomain) subjectDomain = part;
                else if (type === 'Phone' && !subjectPhone) subjectPhone = part;
                else if (type === 'Full Name' && !subjectName) subjectName = part;
            });
        }

        const manualTitle = formData.get("title") as string;
        const defaultTitle = subjectName || subjectUsername || subjectEmail || omniValue?.split(',')[0] || 'New Target';
        const finalTitle = manualTitle?.trim() || defaultTitle;

        const parentId = searchParams.get('parentId');

        try {
            const createRes = await fetch("/api/investigations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: finalTitle,
                    subjectName: subjectName || null,
                    subjectUsername: subjectUsername || null,
                    subjectEmail: subjectEmail || null,
                    subjectPhone: subjectPhone || null,
                    subjectDomain: subjectDomain || null,
                    subjectImageUrl: imagePreview || (formData.get("subjectImageUrl") as string) || null,
                    description: (formData.get("description") as string) || null,
                    parentId: parentId || null,
                }),
            });

            if (!createRes.ok) throw new Error(await createRes.text());
            const investigation = await createRes.json();

            // Immediately redirect — no theatrical animation
            window.location.assign(`/dashboard/investigations/${investigation.id}?scanning=1`);

        } catch (err: any) {
            setError(err?.message || "Failed to create investigation.");
            setLoading(false);
        }
    };

    const detectedBadge = omniValue ? detectType(omniValue) : null;

    return (
        <div className="max-w-2xl mx-auto pt-16 pb-24 px-4">

            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Strategic Reconnaissance</p>
                    <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent text-[8px] uppercase tracking-widest font-black px-2 py-0.5">LTD_CORE_ENGINE</Badge>
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tight mb-2 italic uppercase">Initiate Sweep</h1>
                <p className="text-sm text-text-secondary font-medium">Combine multiple identifiers (Name + Email + Image) for the most accurate recursive expansion.</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

                {/* Omni search bar */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-500 pointer-events-none" />
                    <div className="relative flex items-center gap-3 bg-surface border border-border/20 rounded-2xl px-5 py-5 focus-within:border-accent/50 transition-all duration-300 shadow-2xl backdrop-blur-3xl">
                        <Scan className="w-5 h-5 text-accent shrink-0" />
                        <input
                            name="omniInput"
                            value={omniValue}
                            onChange={(e) => { setOmniValue(e.target.value); setDetectedType(detectType(e.target.value)); }}
                            placeholder="Primary Target (Email, Alias, or Full Name)"
                            className="bg-transparent flex-1 text-base text-text-primary placeholder:text-text-tertiary/40 outline-none font-bold italic uppercase tracking-tight"
                            autoFocus
                        />
                        {detectedBadge && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full shrink-0">
                                {detectedBadge}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload image for biometric search"
                            className={`p-2.5 rounded-xl border transition-all transform hover:scale-105 active:scale-95 ${imagePreview ? 'border-accent/40 bg-accent/10 text-accent ring-2 ring-accent/20' : 'border-border/10 text-text-tertiary hover:text-accent hover:border-accent/20'}`}
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {imagePreview && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex items-center gap-4 bg-surface/80 border border-accent/20 rounded-2xl px-5 py-4 shadow-xl backdrop-blur-xl"
                        >
                            <div className="relative group/thumb">
                                <img src={imagePreview} className="w-14 h-14 object-cover rounded-xl border border-border/10 shadow-lg" alt="Preview" />
                                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover/thumb:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
                                    <Scan className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Visual Vector Attached</div>
                                <div className="text-xs text-text-secondary font-medium">AI will run biometric cross-referencing on this target.</div>
                            </div>
                            <button type="button" onClick={() => setImagePreview(null)} className="p-2 text-text-tertiary hover:text-red-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Info Card about Multi-input */}
                <div className="bg-surface-elevated/40 border border-border/5 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[11px] font-black text-text-primary uppercase tracking-wider mb-1">General Vector Reconnaissance</div>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium">Providing multiple identifiers allows the engine to bridge disconnected footprints and verify identity with mathematical certainty.</p>
                    </div>
                </div>

                {/* Advanced toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full py-4 text-[11px] text-text-tertiary hover:text-accent transition-all font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-border/5 rounded-2xl hover:bg-surface-elevated/30"
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${showAdvanced ? 'bg-accent' : 'bg-text-tertiary'} animate-pulse`} />
                    {showAdvanced ? 'Collapse Vector Details' : 'Expand Vector Details (Multi-Input Search)'}
                </button>

                {showAdvanced && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-surface/20 border border-border/10 rounded-3xl backdrop-blur-2xl"
                    >
                        <Field name="subjectName" label="Full Name" icon={<User className="w-3.5 h-3.5" />} placeholder="John Doe" />
                        <Field name="subjectEmail" label="Email Address" icon={<Mail className="w-3.5 h-3.5" />} placeholder="user@domain.com" />
                        <Field name="subjectUsername" label="Network Handle" icon={<AtSign className="w-3.5 h-3.5" />} placeholder="@handle" />
                        <Field name="subjectPhone" label="Contact Number" icon={<Phone className="w-3.5 h-3.5" />} placeholder="+1..." />
                        <Field name="subjectDomain" label="Infrastructure Vector" icon={<Globe className="w-3.5 h-3.5" />} placeholder="example.com" />
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex flex-col justify-center"
                        >
                            <label className="text-[9px] font-black uppercase tracking-[.2em] text-accent mb-2">Premium Expansion</label>
                            <p className="text-[10px] text-accent/80 font-bold leading-relaxed italic">All fields above will be used as simultaneous pivots for the recursive AI hunter agents.</p>
                        </motion.div>
                        <div className="sm:col-span-2 space-y-1.5 pt-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5" /> Intelligence Objectives
                            </label>
                            <textarea
                                name="description"
                                rows={2}
                                className="w-full bg-surface/80 border border-border/10 rounded-2xl px-5 py-4 text-sm text-text-primary placeholder:text-text-tertiary/30 focus:border-accent/40 outline-none transition-all resize-none shadow-inner"
                                placeholder="Any specific reconnaissance goals for the autonomous clusters..."
                            />
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-5 py-4 rounded-2xl shadow-lg"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-semibold">{error}</span>
                    </motion.div>
                )}

                <Button
                    type="submit"
                    disabled={loading || (!omniValue && !imagePreview && !showAdvanced)}
                    className="w-full h-16 rounded-3xl bg-accent hover:bg-accent-hover text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-accent/20 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-40 group"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Deploying Agents...</>
                    ) : (
                        <><Zap className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" /> Initiate Global Sweep</>
                    )}
                </Button>
            </form>

            {/* Quick examples */}
            <div className="mt-12 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-text-tertiary font-black text-center">Operational Examples</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {["elonmusk", "user@example.com", "bitcoin.org", "+1 555 0100"].map(ex => (
                        <button
                            key={ex}
                            type="button"
                            onClick={() => { setOmniValue(ex); setDetectedType(detectType(ex)); }}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-surface/30 border border-border/10 text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

function Field({ name, label, icon, placeholder }: { name: string; label: string; icon: React.ReactNode; placeholder: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[.2em] text-text-tertiary flex items-center gap-2">
                {icon} {label}
            </label>
            <input
                name={name}
                autoComplete="off"
                className="w-full bg-surface/80 border border-border/10 rounded-2xl px-5 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary/20 focus:border-accent/40 outline-none transition-all shadow-inner font-semibold italic"
                placeholder={placeholder}
            />
        </div>
    );
}
