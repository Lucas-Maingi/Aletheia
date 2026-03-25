"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Loader2, Shield, Plus, Globe, AtSign, Mail, FileText } from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            <DialogContent className="p-0 overflow-hidden bg-surface-2/90 backdrop-blur-3xl border-white/10 shadow-2xl max-w-2xl sm:max-w-2xl ring-1 ring-white/5 !rounded-2xl">
                    <Command 
                        className="w-full h-full bg-transparent flex flex-col" 
                        shouldFilter={false} 
                        loop
                    >
                        <div className="flex items-center border-b border-white/5 px-4 h-14">
                            <Search className="w-5 h-5 text-accent mr-3 shrink-0" />
                            <Command.Input
                                value={search}
                                onValueChange={setSearch}
                                autoFocus
                                placeholder="Search investigations, site settings, or system tools..."
                                className="flex-1 bg-transparent text-white placeholder:text-white/40 border-none outline-none text-sm h-full"
                            />
                            {loading && <Loader2 className="w-4 h-4 text-white/50 animate-spin shrink-0" />}
                            <div className="flex items-center gap-1 shrink-0 ml-3">
                                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/60">ESC</kbd>
                            </div>
                        </div>

                        <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 px-4 pb-4">
                            <Command.Empty className="py-12 text-center text-sm text-white/50">
                                No matching investigations or settings found.
                                <div className="mt-4 flex items-center justify-center">
                                    <button
                                        onClick={() => runAction(() => router.push(`/dashboard/investigations/new?target=${encodeURIComponent(search)}`))}
                                        className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors border border-accent/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Initiate new target sweep for "{search}"
                                    </button>
                                </div>
                            </Command.Empty>

                        {/* Recent Actions (always show when empty search) */}
                        {!search && (
                            <Command.Group heading="Quick Intelligence Sweeps" className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 mt-2">
                                <Command.Item
                                    onSelect={() => runAction(() => router.push("/dashboard/investigations/new?type=username"))}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 text-sm text-text-secondary aria-selected:text-white transition-colors group mt-1"
                                >
                                    <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-accent-blue/20 group-hover:text-accent-blue transition-colors">
                                        <AtSign className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">Username Correlation</span>
                                        <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">Scan 300+ breached databases and forums</span>
                                    </div>
                                </Command.Item>

                                <Command.Item
                                    onSelect={() => runAction(() => router.push("/dashboard/investigations/new?type=domain"))}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 text-sm text-text-secondary aria-selected:text-white transition-colors group mt-1"
                                >
                                    <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">Domain Reconnaissance</span>
                                        <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">Find subdomains, SSL certs, and open ports</span>
                                    </div>
                                </Command.Item>

                                <Command.Item
                                    onSelect={() => runAction(() => router.push("/dashboard/investigations/new"))}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 text-sm text-text-secondary aria-selected:text-white transition-colors group mt-1"
                                >
                                    <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-white/20 transition-colors text-white">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">Advanced Custom Target</span>
                                        <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">Combine emails, phone numbers, and custom parameters</span>
                                    </div>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {/* Results with Risk Intelligence */}
                        {results.length > 0 && (
                            <Command.Group heading="Intelligence Matches" className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-2">
                                {results.map((item) => (
                                    <Command.Item
                                        key={item.id}
                                        onSelect={() => runAction(() => router.push(`/dashboard/investigations/${item.id}`))}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 text-sm text-white transition-colors mt-1 group"
                                    >
                                        <div className={`p-1.5 rounded-md border transition-colors ${
                                            item.risk === 'critical' ? 'bg-danger/10 border-danger/20 text-danger' : 
                                            item.risk === 'elevated' ? 'bg-warning/10 border-warning/20 text-warning' : 
                                            'bg-accent/10 border-accent/20 text-accent'
                                        }`}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-medium">{item.title}</span>
                                            <span className="text-[10px] text-white/40 uppercase tracking-tight">{item.leads} Forensic Artifacts Identified</span>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded border hidden sm:block ${
                                            item.risk === 'critical' ? 'bg-danger/10 border-danger/30 text-danger' : 
                                            item.risk === 'elevated' ? 'bg-warning/10 border-warning/30 text-warning' : 
                                            'bg-success/10 border-success/30 text-success'
                                        }`}>
                                            {item.risk.toUpperCase()}
                                        </div>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Global System Actions */}
                        <Command.Group heading="System Protocols" className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-4">
                            <Command.Item
                                onSelect={() => runAction(() => window.print())}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer aria-selected:bg-white/10 text-sm text-text-secondary aria-selected:text-white transition-colors group mt-1"
                            >
                                <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-accent-blue/20 group-hover:text-accent-blue transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">Generate Intelligence PDF</span>
                                    <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">Export current view as restricted intelligence dossier</span>
                                </div>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
