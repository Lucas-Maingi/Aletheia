"use client";

interface SearchLog {
    id: string;
    connectorType: string;
    query: string;
    resultCount: number;
    createdAt: string;
}

interface Evidence {
    id: string;
    title: string;
    type: string;
    createdAt: string;
}

interface Report {
    id: string;
    title: string;
    content: string;
    format: string;
    createdAt: string;
}

interface InvestigationData {
    id: string;
    status: string;
    logs: SearchLog[];
    evidence: Evidence[];
    entities: any[];
    reports: Report[];
    _count?: {
        evidence: number;
        entities: number;
    };
}

export function formatTerminalLogs(data: InvestigationData): string[] {
    const combined: { timestamp: number; message: string; type: 'log' | 'evidence' }[] = [];

    // Add search logs
    data.logs.forEach(log => {
        let msg = '';
        if (log.connectorType === 'agent_start') {
            msg = `[EXEC] ${log.query}`;
        } else if (log.connectorType === 'system') {
            msg = `[SYS] ${log.query}`;
        } else if (log.connectorType === 'system_error') {
            msg = `[ERR] ${log.query}`;
        } else {
            msg = `[NODE] ${log.query}`;
        }
        
        combined.push({
            timestamp: new Date(log.createdAt).getTime(),
            message: msg,
            type: 'log'
        });
    });

    // Add evidence discoveries
    data.evidence.slice(0, 15).forEach(ev => {
        combined.push({
            timestamp: new Date(ev.createdAt).getTime(),
            message: `[INTEL] Discovery: ${ev.title} resolved.`,
            type: 'evidence'
        });
    });

    // Sort by timestamp
    combined.sort((a, b) => a.timestamp - b.timestamp);

    // Initial message - ALWAYS at the top
    const finalLogs = ["🚀 Initializing Aletheia Intelligence Engine v2.5.0..."];
    
    combined.forEach(item => {
        finalLogs.push(item.message);
    });

    if (data.status === 'closed' || data.status === 'complete') {
        finalLogs.push("✔ Scan complete. Disconnecting from secure circuit.");
    } else if (data.status === 'error') {
        finalLogs.push("✖ Scan interrupted. Check system logs for termination details.");
    }

    return finalLogs;
}

export async function pollInvestigation(id: string): Promise<InvestigationData | null> {
    try {
        const res = await fetch(`/api/investigations/${id}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        if (!res.ok) {
            console.error(`Poll failed: ${res.status}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error(`Poll error:`, err);
        return null;
    }
}
