"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search, Mail, AtSign, Phone, Globe,
    Loader2, AlertCircle, ImageIcon, X,
    ArrowRight, Scan, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewInvestigationPage() {
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
        const params = new URLSearchParams(window.location.search);
        const target = params.get('target');
        if (target && !omniValue) {
            setOmniValue(target);
            setDetectedType(detectType(target));
            const timer = setTimeout(() => {
                formRef.current?.requestSubmit();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

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
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
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
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3">New Investigation</p>
                <h1 className="text-4xl font-black text-text-primary tracking-tight mb-2">Who are you investigating?</h1>
                <p className="text-sm text-text-secondary">Enter any identifier to start an AI-powered intelligence sweep.</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

                {/* Omni search bar */}
                <div className="relative">
                    <div className="flex items-center gap-3 bg-surface/60 border border-border/20 rounded-2xl px-5 py-4 focus-within:border-accent/50 transition-all duration-300 shadow-lg">
                        <Search className="w-5 h-5 text-text-tertiary shrink-0" />
                        <input
                            name="omniInput"
                            value={omniValue}
                            onChange={(e) => { setOmniValue(e.target.value); setDetectedType(detectType(e.target.value)); }}
                            placeholder="Email, username, full name, domain, phone..."
                            className="bg-transparent flex-1 text-base text-text-primary placeholder:text-text-tertiary/40 outline-none"
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
                            title="Upload image for facial search"
                            className={`p-2 rounded-xl border transition-all ${imagePreview ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border/10 text-text-tertiary hover:text-text-primary'}`}
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {imagePreview && (
                        <div className="mt-3 flex items-center gap-3 bg-surface/40 border border-border/10 rounded-xl px-4 py-3">
                            <img src={imagePreview} className="w-10 h-10 object-cover rounded-lg" alt="Preview" />
                            <span className="text-xs text-text-secondary flex-1">Image attached for visual search</span>
                            <button type="button" onClick={() => setImagePreview(null)} className="text-text-tertiary hover:text-red-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Advanced toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors font-medium flex items-center gap-1.5"
                >
                    <span className="text-accent">{showAdvanced ? '−' : '+'}</span>
                    {showAdvanced ? 'Hide advanced fields' : 'Add more details (name, phone, domain...)'}
                </button>

                {showAdvanced && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 bg-surface/30 border border-border/10 rounded-2xl">
                        <Field name="subjectName" label="Full Name" icon={<User className="w-3.5 h-3.5" />} placeholder="John Doe" />
                        <Field name="subjectEmail" label="Email" icon={<Mail className="w-3.5 h-3.5" />} placeholder="user@domain.com" />
                        <Field name="subjectUsername" label="Username / Handle" icon={<AtSign className="w-3.5 h-3.5" />} placeholder="@handle" />
                        <Field name="subjectPhone" label="Phone" icon={<Phone className="w-3.5 h-3.5" />} placeholder="+1..." />
                        <Field name="subjectDomain" label="Domain" icon={<Globe className="w-3.5 h-3.5" />} placeholder="example.com" />
                        <Field name="title" label="Case Name (optional)" icon={<Scan className="w-3.5 h-3.5" />} placeholder="Operation: ..." />
                        <div className="sm:col-span-2">
                            <Field name="subjectImageUrl" label="Image URL (alternative to upload)" icon={<ImageIcon className="w-3.5 h-3.5" />} placeholder="https://..." />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5" /> Case Objectives
                            </label>
                            <textarea
                                name="description"
                                rows={2}
                                className="w-full bg-foreground/[0.03] border border-border/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/30 focus:border-accent/40 outline-none transition-all resize-none"
                                placeholder="Any specific intelligence objectives for the AI agent..."
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading || (!omniValue && !imagePreview && !showAdvanced)}
                    className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-accent/20 transition-all disabled:opacity-40"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating investigation...</>
                    ) : (
                        <><ArrowRight className="w-4 h-4 mr-2" /> Start Intelligence Sweep</>
                    )}
                </Button>
            </form>

            {/* Quick examples */}
            {!omniValue && (
                <div className="mt-10 space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {["elonmusk", "user@example.com", "bitcoin.org", "+1 555 0100"].map(ex => (
                            <button
                                key={ex}
                                type="button"
                                onClick={() => { setOmniValue(ex); setDetectedType(detectType(ex)); }}
                                className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-surface/40 border border-border/10 text-text-secondary hover:text-text-primary hover:border-border/30 transition-all"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ name, label, icon, placeholder }: { name: string; label: string; icon: React.ReactNode; placeholder: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5">
                {icon} {label}
            </label>
            <input
                name={name}
                className="w-full bg-foreground/[0.03] border border-border/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/30 focus:border-accent/40 outline-none transition-all"
                placeholder={placeholder}
            />
        </div>
    );
}
