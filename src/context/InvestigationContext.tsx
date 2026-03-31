"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { pollInvestigation, formatTerminalLogs } from '@/lib/investigation-polling';
import { FacialMatch } from '@/connectors/visualIntel';

interface InvestigationContextType {
    activeInvestigationId: string | null;
    setActiveInvestigationId: (id: string | null) => void;
    scanStatus: 'idle' | 'pending' | 'scanning' | 'complete' | 'error';
    setScanStatus: (status: 'idle' | 'pending' | 'scanning' | 'complete' | 'error') => void;
    evidenceCount: number;
    setEvidenceCount: (count: number) => void;
    evidence: any[];
    setEvidence: (evidence: any[]) => void;
    entities: any[];
    setEntities: (entities: any[]) => void;
    reports: any[];
    setReports: (reports: any[]) => void;
    facialMatches: FacialMatch[];
    setFacialMatches: (matches: FacialMatch[]) => void;
    terminalLogs: string[];
    setTerminalLogs: (logs: string[]) => void;
    refresh: () => Promise<void>;
    startScan: (id: string) => Promise<void>;
    forceVisualScrape: () => Promise<void>;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export function InvestigationProvider({ children }: { children: React.ReactNode }) {
    const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<'idle' | 'pending' | 'scanning' | 'complete' | 'error'>('idle');
    const [evidenceCount, setEvidenceCount] = useState(0);
    const [evidence, setEvidence] = useState<any[]>([]);
    const [entities, setEntities] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [facialMatches, setFacialMatches] = useState<FacialMatch[]>([]);
    const [terminalLogs, setTerminalLogs] = useState<string[]>(["[SYS] Connecting to Aletheia Intelligence Nodes..."]);

    // Unified Refresh Function
    const refresh = useCallback(async () => {
        if (!activeInvestigationId) return;
        
        const data = await pollInvestigation(activeInvestigationId);
        if (data) {
            const formatted = formatTerminalLogs(data);
            
            setTerminalLogs(prev => {
                const incoming = formatTerminalLogs(data);
                
                // If server is empty but we have local logs, don't wipe.
                if (data.logs.length === 0 && prev.length > 1) return prev;

                // If they are exactly the same, don't trigger re-render
                if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev;

                // If incoming is longer than prev, or substantially different, use incoming
                if (incoming.length >= prev.length) return incoming;

                // Special case: Preserve heartbeats if incoming is shorter (rare race condition)
                return incoming;
            });

            setEvidence(data.evidence || []);
            setEntities(data.entities || []);
            setEvidenceCount(data.evidence?.length || 0);
            
            // CRITICAL FIX: Update reports from poll so Summary tab stays live
            if (data.reports && data.reports.length > 0) {
                setReports(data.reports);
            }
            
            if ((data as any).facialMatches) {
                setFacialMatches((data as any).facialMatches);
            }
            
            // CRITICAL: Synchronize scan status to stop heartbeats immediately
            if (data.status === 'closed' || data.status === 'complete') {
                setScanStatus('complete');
            } else if (data.status === 'active' || data.status === 'scanning' || data.status === 'pending') {
                setScanStatus('scanning');
            } else if (data.status === 'error') {
                setScanStatus('error');
            }
        }
    }, [activeInvestigationId]);

    // Proactive fetch when active ID changes
    useEffect(() => {
        if (!activeInvestigationId) {
            // Only clear logs if we are truly unsetting the investigation, 
            // not just transitioning during a scan redirect.
            if (scanStatus === 'idle' || scanStatus === 'complete') {
                setTerminalLogs([]);
            }
            setEvidenceCount(0);
            return;
        }
        
        // Initial handshake preserved during redirection
        if (terminalLogs.length < 2) {
            refresh();
        }
    }, [activeInvestigationId, refresh, terminalLogs.length, scanStatus]);

    // Force Re-Sync for Recovery
    const forceSync = useCallback(async () => {
        if (!activeInvestigationId || scanStatus !== 'scanning') return;
        
        console.log(`[Context] Force re-sync triggered for ${activeInvestigationId}`);
        try {
            const res = await fetch(`/api/investigations/${activeInvestigationId}/sync`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    const formatted = formatTerminalLogs(data);
                    setTerminalLogs(formatted);
                    setEvidence(data.evidence || []);
                    setEntities(data.entities || []);
                    setEvidenceCount(data.evidence?.length || 0);
                    
                    if (data.status === 'closed' || data.status === 'complete') {
                        setScanStatus('complete');
                    }
                }
            }
        } catch (err) {
            console.error("Force sync failed:", err);
        }
    }, [activeInvestigationId, scanStatus]);

    // Global Polling Effect
    useEffect(() => {
        if (!activeInvestigationId || (scanStatus !== 'scanning' && scanStatus !== 'pending')) return;

        console.log(`[Context] Polling sequence initiated (Status: ${scanStatus})`);

        let lastLogCount = terminalLogs.length;
        let stallCount = 0;

        // GHOST HEARTBEAT: If no server logs for 12s, inject a UI-only heartbeat
        // RECOVERY TRIGGER: If no server logs for 24s, force a re-sync
        const monitorInterval = setInterval(() => {
            // CRITICAL: Stop heartbeats if scan is already done from server POV
            if (scanStatus !== 'scanning') {
                clearInterval(monitorInterval);
                return;
            }

            if (terminalLogs.length === lastLogCount) {
                stallCount++;
                console.log(`[Context] Stall detected (count: ${stallCount})`);
                
                if (stallCount === 1) {
                    setTerminalLogs(prev => [...prev, "[SYS] Sustaining data relay... (Optimization in progress)"]);
                } else if (stallCount === 3) {
                    setTerminalLogs(prev => [...prev, "[SYS] Connection stall detected. Initiating core re-sync..."]);
                    forceSync();
                } else if (stallCount >= 6) {
                    // Fail-safe: After many stalls, assume complete
                    setScanStatus('complete');
                    setTerminalLogs(prev => [...prev, "[SYS] Global relay timeout. Engine finalized to prevent circuit hang."]);
                }
            } else {
                stallCount = 0;
            }
            lastLogCount = terminalLogs.length;
        }, 12000);

        // Safety timeout: If scan goes longer than 10 minutes, assume it's stuck
        const safetyTimeout = setTimeout(() => {
            if (scanStatus === 'scanning') {
                console.warn("[Context] Polling safety timeout reached.");
                setScanStatus('complete');
                setTerminalLogs(prev => [...prev, "[SYS] Global timeout. Intelligence synthesis finalized."]);
            }
        }, 600000); // 10 mins

        const interval = setInterval(refresh, 4000);
        return () => {
            clearInterval(interval);
            clearInterval(monitorInterval);
            clearTimeout(safetyTimeout);
        };
    }, [activeInvestigationId, scanStatus, refresh, terminalLogs.length, forceSync]);

    const startScan = useCallback(async (id: string) => {
        if (id !== activeInvestigationId) {
            setTerminalLogs(["🚀 Initializing Aletheia Intelligence Engine v2.5.0...", "🔐 Validating execution matrix..."]);
            setFacialMatches([]);
        }
        
        setActiveInvestigationId(id);
        setScanStatus('scanning');
        
        try {
            const geminiKey = typeof window !== 'undefined' ? localStorage.getItem("openvector_gemini_key") : null;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (geminiKey) headers['x-gemini-key'] = geminiKey;

            // Phase 1: Core OSINT Sweep
            console.log(`[Context] Initiating Core Sweep...`);
            const coreRes = await fetch(`/api/investigations/${id}/scan/core`, { method: "POST", headers });
            if (!coreRes.ok) throw new Error("Core sweep failed to initialize");
            
            setTerminalLogs(prev => [...prev, "[SYS] Transitioning to Visual Analysis Processor..."]);

            // Phase 2: Visual/Biometric Sweep
            console.log(`[Context] Initiating Visual Sweep...`);
            const visualRes = await fetch(`/api/investigations/${id}/scan/visual`, { method: "POST", headers });
            if (visualRes.ok) {
                const visualData = await visualRes.json();
                if (visualData.facialMatches && visualData.facialMatches.length > 0) {
                    setFacialMatches(visualData.facialMatches);
                }
            }

            setTerminalLogs(prev => [...prev, "[SYS] Synthesizing Final Intelligence Dossier..."]);

            // Phase 3: AI Report Synthesis
            console.log(`[Context] Initiating AI Synthesis...`);
            const synthRes = await fetch(`/api/investigations/${id}/scan/synthesis`, { method: "POST", headers });

            if (synthRes.ok) {
                const data = await synthRes.json();
                if (data.status === 'complete') {
                    setScanStatus('complete');
                    setTerminalLogs(prev => [...prev, "✔ Scan complete. Intelligence isolated securely."]);
                }
                await refresh(); // Load everything
            } else {
                const errData = await synthRes.json().catch(() => ({}));
                throw new Error(errData.error || "Synthesis node collapsed");
            }
        } catch (err: any) {
            console.error("Context Scan Error:", err);
            setScanStatus('error');
            setTerminalLogs(prev => [...prev, `[ERR] Critical engine progression failure: ${err.message || String(err)}`]);
        }
    }, [activeInvestigationId, refresh]);

    const forceVisualScrape = useCallback(async () => {
        if (!activeInvestigationId) return;
        
        setScanStatus('scanning');
        setTerminalLogs(prev => [...prev, "[SYS] Manual Override: Initiating Deep Visual Siphon Hub...", "[SYS] Bypassing cache... Re-scanning Google, Google Lens, Bing, and Yandex..."]);

        try {
            const geminiKey = typeof window !== 'undefined' ? localStorage.getItem("openvector_gemini_key") : null;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (geminiKey) headers['x-gemini-key'] = geminiKey;

            const res = await fetch(`/api/investigations/${activeInvestigationId}/scan/visual`, { 
                method: "POST", 
                headers,
                body: JSON.stringify({ force: true })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.facialMatches) {
                    setFacialMatches(prev => {
                        const existingUrls = new Set(prev.map(p => p.url));
                        const newOnes = data.facialMatches.filter((m: any) => !existingUrls.has(m.url));
                        return [...prev, ...newOnes];
                    });
                }
                setScanStatus('complete');
                setTerminalLogs(prev => [...prev, `✔ Manual Visual Recon complete. Found ${data.facialMatches?.length || 0} additional leads.`]);
                await refresh();
            } else {
                throw new Error("Visual Siphon Hub collapsed.");
            }
        } catch (err: any) {
            console.error("Force Scrape Error:", err);
            setScanStatus('error');
            setTerminalLogs(prev => [...prev, `[ERR] Visual Siphon failure: ${err.message}`]);
        }
    }, [activeInvestigationId, refresh]);

    return (
        <InvestigationContext.Provider value={{
            activeInvestigationId,
            setActiveInvestigationId,
            scanStatus,
            setScanStatus,
            evidenceCount,
            setEvidenceCount,
            evidence,
            setEvidence,
            entities,
            setEntities,
            reports,
            setReports,
            facialMatches,
            setFacialMatches,
            terminalLogs,
            setTerminalLogs,
            refresh,
            startScan,
            forceVisualScrape
        }}>
            {children}
        </InvestigationContext.Provider>
    );
}

export function useInvestigation() {
    const context = useContext(InvestigationContext);
    if (!context) {
        throw new Error('useInvestigation must be used within an InvestigationProvider');
    }
    return context;
}
