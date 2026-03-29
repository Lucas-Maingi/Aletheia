"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Loader2, Shield, Plus, Globe, AtSign, Mail, FileText, MessageSquare, Database, ImageIcon } from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                sessionStorage.setItem('aletheia_pending_image', base64);
                setOpen(false);
                router.push('/dashboard/investigations/new?autostart=true');
            };
            reader.readAsDataURL(file);
        }
    };

    // Toggle the menu when ⌘K is pressed or via custom event
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        const toggle = () => setOpen((open) => !open);

        document.addEventListener("keydown", down);
        window.addEventListener("ale-toggle-command-palette", toggle);
        
        return () => {
            document.removeEventListener("keydown", down);
            window.removeEventListener("ale-toggle-command-palette", toggle);
        };
    }, []);

    // Perform search when input changes
    useEffect(() => {
        if (!search) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                // Here we would hit an API endpoint, but for now we'll route to /api/search if we had one
                // Alternatively, we can just suggest Quick Actions based on the text length
                const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const runAction = (action: () => void) => {
        setOpen(false);
        action();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden bg-surface-2/80 backdrop-blur-[40px] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-2xl sm:max-w-2xl ring-1 ring-white/5 !rounded-2xl border-t-accent/20">
                    <Command 
                        className="w-full h-full bg-transparent flex flex-col" 
                        shouldFilter={false} 
                        loop
                    >
                        <div className="flex items-center border-b border-white/5 px-4 h-15">
                            <Search className="w-5 h-5 text-accent mr-3 shrink-0 opacity-70" />
                            <Command.Input
                                value={search}
                                onValueChange={setSearch}
                                autoFocus
                                placeholder="Search investigations, site protocols, or mission settings..."
                                className="flex-1 bg-transparent text-white placeholder:text-white/20 border-none outline-none text-[15px] h-full font-medium"
                            />
                            {loading && <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />}
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                <kbd className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white/40 uppercase tracking-tighter">ESC_CLOSE</kbd>
                            </div>
                        </div>

                        <Command.List className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-accent/20 p-2 space-y-2">
                            <Command.Empty className="py-20 text-center">
                                <Search className="w-10 h-10 text-white/5 mx-auto mb-4" />
                                <p className="text-sm text-white/30 font-medium">No matching intelligence found.</p>
                                <div className="mt-6 flex items-center justify-center">
                                    <button
                                        onClick={() => runAction(() => router.push(`/dashboard/investigations/new?target=${encodeURIComponent(search)}`))}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-background rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Launch new sweep for "{search}"
                                    </button>
                                </div>
                            </Command.Empty>

                        {/* Quick Navigation (Always available or pinned) */}
                        {!search && (
                            <Command.Group heading="Mission_Navigation" className="px-3 pb-2 pt-1">
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {[
                                        { label: "Mission Dashboard", sub: "Operational Overview", icon: Shield, path: "/dashboard", color: "text-accent" },
                                        { label: "Analyst Settings", sub: "System Configuration", icon: Search, path: "/dashboard/settings", color: "text-text-tertiary" },
                                        { label: "AI Analyst Hub", sub: "Neural Briefing", icon: MessageSquare, path: "/dashboard/chat", color: "text-emerald-400" },
                                        { label: "Case Archive", sub: "Stored Intelligence", icon: Database, path: "/dashboard/investigations", color: "text-accent" }
                                    ].map((item) => (
                                        <Command.Item
                                            key={item.label}
                                            onSelect={() => runAction(() => router.push(item.path))}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 cursor-pointer aria-selected:bg-white/[0.1] aria-selected:border-accent/30 transition-all group"
                                        >
                                            <div className={`p-2 rounded-lg bg-background/40 border border-white/5 mt-0.5 ${item.color}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">{item.label}</span>
                                                <span className="text-[10px] text-white/30 font-medium">{item.sub}</span>
                                            </div>
                                        </Command.Item>
                                    ))}
                                </div>
                            </Command.Group>
                        )}
                        
                        {!search && (
                            <Command.Group heading="Quick_Actions" className="px-3 pb-2">
                                <Command.Item
                                    onSelect={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 transition-all border border-transparent aria-selected:border-accent/30 group"
                                >
                                    <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">Visual Intelligence Sweep</span>
                                        <span className="text-[10px] text-white/30 font-medium uppercase tracking-tight">Upload face or document for biometric verification</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </Command.Item>
                            </Command.Group>
                        )}

                        {/* Custom Search (Dynamic Results) */}
                        {(search || results.length > 0) && (
                            <Command.Group heading="Intelligence_Matches" className="px-3">
                                {results.length > 0 ? results.map((item) => (
                                    <Command.Item
                                        key={item.id}
                                        onSelect={() => runAction(() => router.push(`/dashboard/investigations/${item.id}`))}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 transition-all mb-1 border border-transparent aria-selected:border-white/5 group"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                                            item.risk === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                                            item.risk === 'elevated' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                                            'bg-accent/10 border-accent/20 text-accent'
                                        }`}>
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-sm font-bold text-white truncate">{item.title}</span>
                                                <span className="text-[9px] font-mono font-bold text-white/20 uppercase">ID_{item.id.slice(0,6)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-white/40 font-medium truncate">{item.target}</span>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-[9px] font-black text-accent/60 uppercase tracking-widest">{item.leads} Signal Artifacts</span>
                                            </div>
                                        </div>
                                    </Command.Item>
                                )) : search.length > 2 && (
                                    <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                        <Loader2 className="w-5 h-5 text-accent/50 animate-spin mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Searching Global Registry...</p>
                                    </div>
                                )}
                            </Command.Group>
                        )}

                        {/* System Protocols */}
                        <Command.Group heading="System_Protocols" className="px-3 pb-2 pt-2 border-t border-white/5 mt-4">
                            <Command.Item
                                onSelect={() => runAction(() => window.print())}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-accent-blue/10 group-hover:text-accent-blue transition-all">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white group-aria-selected:text-accent transition-colors">Generate Intelligence PDF</span>
                                    <span className="text-[10px] text-white/30 font-medium uppercase tracking-tight">Export restricted operational dossier</span>
                                </div>
                                <div className="ml-auto flex items-center gap-1 opacity-0 group-aria-selected:opacity-100 transition-opacity">
                                    <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-white/40">CTRL_P</kbd>
                                </div>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
