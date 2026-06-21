"use client";

import { motion } from "framer-motion";
import { 
  Building2, Globe, FileText, User, MapPin, 
  Smartphone, Briefcase, Mail, Key, Shield, Hash,
  Database, Network, Crosshair, GitBranch, CheckCircle,
  Car, Phone, Zap, ZoomIn, ZoomOut, Maximize2, X,
  AtSign, Users
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

// Helper to determine icon based on category/platform
const getIcon = (type: 'target' | 'evidence' | 'entity', subType?: string) => {
    if (type === 'target') return Crosshair;
    const s = (subType || '').toLowerCase();
    if (s === 'email' || s.includes('email')) return Mail;
    if (s === 'domain' || s.includes('domain')) return Globe;
    if (s === 'username' || s.includes('username')) return AtSign;
    if (s === 'name' || s.includes('name')) return Users;
    if (s === 'phone' || s.includes('phone')) return Phone;
    if (s === 'plate' || s === 'vehicle' || s.includes('registry') || s.includes('lpr')) return Car;
    if (s === 'crypto') return Hash;
    if (s === 'breach' || s.includes('breach') || s.includes('leak') || s === 'leak') return Database;
    return Network;
};

interface GraphNode {
    id: string;
    label: string;
    type: 'target' | 'evidence' | 'entity';
    subType?: string;
    radius: number;
    color: string;
    icon: any;
    x: number;
    y: number;
    vx: number;
    vy: number;
    details?: any;
}

interface GraphEdge {
    source: string;
    target: string;
    label?: string;
    type: 'direct' | 'mention' | 'provenance';
    color: string;
}

export function IdentityGraph({ target, evidence, entities }: { target: string, evidence: any[], entities?: any[] }) {
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    
    // Zoom and Pan Transform state
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPos = useRef<{ x: number, y: number } | null>(null);

    // Selected and Hovered Node state
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Responsive dimensions
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width: width || 800, height: height || 500 });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Generate Nodes and Edges based on inputs
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        const width = dimensions.width;
        const height = dimensions.height;
        
        // 1. Add Target Node (Anchor Center)
        nodes.push({
            id: 'target',
            label: target,
            type: 'target',
            radius: 28,
            color: '#00ffc8', // Cyan
            icon: Crosshair,
            x: width / 2,
            y: height / 2,
            vx: 0,
            vy: 0,
            details: { value: target, notes: 'Primary target vector under analysis.' }
        });
        
        // 2. Add Entities
        const safeEntities = entities || [];
        safeEntities.forEach((en, idx) => {
            const id = `entity-${en.id || idx}`;
            if (nodes.some(n => n.label === en.value)) return;
            
            let color = '#38bdf8'; // Light Blue
            if (en.type === 'email') color = '#10b981'; // Green
            if (en.type === 'plate' || en.type === 'vehicle') color = '#f59e0b'; // Amber/Orange
            if (en.type === 'username') color = '#eab308'; // Yellow
            if (en.type === 'phone') color = '#3b82f6'; // Blue
            if (en.type === 'domain') color = '#8b5cf6'; // Purple
            
            const angle = (idx / Math.max(1, safeEntities.length)) * Math.PI * 2;
            const dist = 120 + Math.random() * 30;
            
            nodes.push({
                id,
                label: en.value,
                type: 'entity',
                subType: en.type,
                radius: 16,
                color,
                icon: getIcon('entity', en.type),
                x: width / 2 + Math.cos(angle) * dist,
                y: height / 2 + Math.sin(angle) * dist,
                vx: 0,
                vy: 0,
                details: en
            });
            
            edges.push({
                source: 'target',
                target: id,
                type: 'direct',
                color: 'rgba(56, 189, 248, 0.15)'
            });
        });
        
        // 3. Add Evidence
        const safeEvidence = evidence || [];
        const topEvidence = safeEvidence
            .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
            .slice(0, 20);
            
        topEvidence.forEach((ev, idx) => {
            const id = `evidence-${ev.id || idx}`;
            
            let color = '#64748b'; // Slate
            if (ev.tags?.includes('leak') || ev.tags?.includes('breach')) color = '#ef4444'; // Red
            if (ev.tags?.includes('registry') || ev.tags?.includes('vehicle')) color = '#f59e0b'; // Amber
            
            const angle = ((idx + 0.5) / Math.max(1, topEvidence.length)) * Math.PI * 2;
            const dist = 210 + Math.random() * 40;
            
            nodes.push({
                id,
                label: ev.title,
                type: 'evidence',
                subType: ev.tags || ev.type,
                radius: 20,
                color,
                icon: getIcon('evidence', ev.tags || ev.type),
                x: width / 2 + Math.cos(angle) * dist,
                y: height / 2 + Math.sin(angle) * dist,
                vx: 0,
                vy: 0,
                details: ev
            });
            
            edges.push({
                source: 'target',
                target: id,
                type: 'direct',
                color: 'rgba(255, 255, 255, 0.05)'
            });
            
            // Parent-child Provenance link
            if (ev.provenanceSourceId) {
                const parentId = `evidence-${ev.provenanceSourceId}`;
                if (topEvidence.some(p => p.id === ev.provenanceSourceId)) {
                    edges.push({
                        source: parentId,
                        target: id,
                        type: 'provenance',
                        label: 'Provenances From',
                        color: 'rgba(0, 255, 200, 0.35)'
                    });
                }
            }
            
            // Interconnected correlations (Chainlink relationships!)
            safeEntities.forEach(en => {
                const entityNode = nodes.find(n => n.type === 'entity' && n.label === en.value);
                if (entityNode) {
                    const content = ((ev.content || '') + ' ' + (ev.title || '')).toLowerCase();
                    const valueLower = en.value.toLowerCase();
                    if (content.includes(valueLower)) {
                        edges.push({
                            source: id,
                            target: entityNode.id,
                            type: 'mention',
                            label: 'Correlated Point',
                            color: 'rgba(245, 158, 11, 0.3)' // Amber glowing edge
                        });
                    }
                }
            });
        });
        
        return { initialNodes: nodes, initialEdges: edges };
    }, [target, evidence, entities, dimensions.width, dimensions.height]);

    const [nodesState, setNodesState] = useState<GraphNode[]>([]);
    const [edgesState, setEdgesState] = useState<GraphEdge[]>([]);

    useEffect(() => {
        setNodesState(initialNodes);
        setEdgesState(initialEdges);
    }, [initialNodes, initialEdges]);

    // Dragging Refs
    const draggedNodeIdRef = useRef<string | null>(null);
    const dragPosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

    // Forces Tick loop
    useEffect(() => {
        if (nodesState.length === 0) return;
        
        let animationFrameId: number;
        
        const tick = () => {
            setNodesState(prevNodes => {
                const localNodes = prevNodes.map(n => ({ ...n }));
                
                const kRepel = 1500;   // Repulsion coefficient
                const kAttract = 0.04;  // Spring tension
                const dRest = 110;      // Rest distance
                const damping = 0.82;   // Velocity damping
                
                // 1. Repulsion between all nodes
                for (let i = 0; i < localNodes.length; i++) {
                    const nA = localNodes[i];
                    for (let j = i + 1; j < localNodes.length; j++) {
                        const nB = localNodes[j];
                        const dx = nB.x - nA.x;
                        const dy = nB.y - nA.y;
                        const distSq = dx * dx + dy * dy;
                        const dist = Math.sqrt(distSq) || 0.1;
                        
                        if (dist < 260) {
                            const force = kRepel / distSq;
                            const fx = (dx / dist) * force;
                            const fy = (dy / dist) * force;
                            
                            nA.vx -= fx;
                            nA.vy -= fy;
                            nB.vx += fx;
                            nB.vy += fy;
                        }
                    }
                }
                
                // 2. Attraction along edges
                edgesState.forEach(edge => {
                    const nA = localNodes.find(n => n.id === edge.source);
                    const nB = localNodes.find(n => n.id === edge.target);
                    if (nA && nB) {
                        const dx = nB.x - nA.x;
                        const dy = nB.y - nA.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                        
                        const force = (dist - dRest) * kAttract;
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;
                        
                        nA.vx += fx;
                        nA.vy += fy;
                        nB.vx -= fx;
                        nB.vy -= fy;
                    }
                });
                
                // 3. Central gravity pulling nodes towards center
                const cX = dimensions.width / 2;
                const cY = dimensions.height / 2;
                localNodes.forEach(node => {
                    if (node.id === 'target') {
                        node.x = cX;
                        node.y = cY;
                        node.vx = 0;
                        node.vy = 0;
                        return;
                    }
                    const dx = cX - node.x;
                    const dy = cY - node.y;
                    
                    node.vx += dx * 0.007;
                    node.vy += dy * 0.007;
                });
                
                // 4. Update coordinates & apply damping
                return localNodes.map(node => {
                    if (node.id === 'target') return node;
                    
                    if (draggedNodeIdRef.current === node.id) {
                        node.x = dragPosRef.current.x;
                        node.y = dragPosRef.current.y;
                        node.vx = 0;
                        node.vy = 0;
                        return node;
                    }
                    
                    let vx = node.vx * damping;
                    let vy = node.vy * damping;
                    
                    const speed = Math.sqrt(vx * vx + vy * vy);
                    if (speed > 8) {
                        vx = (vx / speed) * 8;
                        vy = (vy / speed) * 8;
                    }
                    
                    let x = node.x + vx;
                    let y = node.y + vy;
                    
                    const pad = node.radius + 15;
                    if (x < pad) { x = pad; vx = 0; }
                    if (x > dimensions.width - pad) { x = dimensions.width - pad; vx = 0; }
                    if (y < pad) { y = pad; vy = 0; }
                    if (y > dimensions.height - pad) { y = dimensions.height - pad; vy = 0; }
                    
                    return { ...node, x, y, vx, vy };
                });
            });
            
            animationFrameId = requestAnimationFrame(tick);
        };
        
        animationFrameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrameId);
    }, [edgesState, dimensions.width, dimensions.height]);

    // Drag handlers
    const updateDragPos = (clientX: number, clientY: number) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        const x = (mouseX - transform.x) / transform.k;
        const y = (mouseY - transform.y) / transform.k;
        
        dragPosRef.current = { x, y };
    };

    const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        e.preventDefault();
        draggedNodeIdRef.current = nodeId;
        setDraggedNodeId(nodeId);
        updateDragPos(e.clientX, e.clientY);
    };

    // Pan Handlers
    const handleBgMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Left click only
        setIsPanning(true);
        lastPanPos.current = { x: e.clientX, y: e.clientY };
    };

    // Window Mouse Listeners
    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            if (draggedNodeIdRef.current) {
                updateDragPos(e.clientX, e.clientY);
            } else if (isPanning && lastPanPos.current) {
                const dx = e.clientX - lastPanPos.current.x;
                const dy = e.clientY - lastPanPos.current.y;
                setTransform(prev => ({
                    ...prev,
                    x: prev.x + dx,
                    y: prev.y + dy
                }));
                lastPanPos.current = { x: e.clientX, y: e.clientY };
            }
        };
        
        const handleWindowMouseUp = () => {
            draggedNodeIdRef.current = null;
            setDraggedNodeId(null);
            setIsPanning(false);
            lastPanPos.current = null;
        };
        
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isPanning, transform]);

    // Zoom Handlers
    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const zoomFactor = 1.08;
        const nextK = e.deltaY < 0 ? transform.k * zoomFactor : transform.k / zoomFactor;
        const k = Math.max(0.15, Math.min(3, nextK));
        
        if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const x = mouseX - (mouseX - transform.x) * (k / transform.k);
            const y = mouseY - (mouseY - transform.y) * (k / transform.k);
            
            setTransform({ x, y, k });
        }
    };

    const zoomIn = () => {
        setTransform(prev => {
            const k = Math.min(3, prev.k * 1.25);
            return {
                x: dimensions.width / 2 - (dimensions.width / 2 - prev.x) * (k / prev.k),
                y: dimensions.height / 2 - (dimensions.height / 2 - prev.y) * (k / prev.k),
                k
            };
        });
    };

    const zoomOut = () => {
        setTransform(prev => {
            const k = Math.max(0.15, prev.k / 1.25);
            return {
                x: dimensions.width / 2 - (dimensions.width / 2 - prev.x) * (k / prev.k),
                y: dimensions.height / 2 - (dimensions.height / 2 - prev.y) * (k / prev.k),
                k
            };
        });
    };

    const resetZoom = () => {
        setTransform({ x: 0, y: 0, k: 1 });
    };

    // Filter nodes to highlight matches
    const isFaded = (nodeId: string) => {
        if (hoveredNodeId === null) return false;
        if (hoveredNodeId === nodeId) return false;
        
        const isConnected = edgesState.some(edge => 
            (edge.source === hoveredNodeId && edge.target === nodeId) ||
            (edge.source === nodeId && edge.target === hoveredNodeId)
        );
        
        return !isConnected;
    };

    return (
        <div ref={containerRef} className="relative w-full h-[550px] bg-background/40 border border-border/10 rounded-2xl overflow-hidden flex flex-col group select-none shadow-glow-cyan-sm">
            {/* Ambient scanlines & cyberpunk grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
            <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none z-0" />

            {/* Top Stats HUD */}
            <div className="absolute top-4 left-4 z-10 font-mono text-[9px] text-text-tertiary bg-surface-elevated/80 border border-border/10 rounded-xl px-4 py-2 flex items-center gap-4 backdrop-blur-xl">
                <span className="flex items-center gap-1.5"><Network className="w-3.5 h-3.5 text-accent animate-pulse" /> NODES: {nodesState.length}</span>
                <span className="opacity-30">|</span>
                <span>CORRELATIONS: {edgesState.length}</span>
                <span className="opacity-30">|</span>
                <span className="text-accent uppercase font-black italic">Chainlink Engine Active</span>
            </div>

            {/* Controls panel */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 bg-surface-elevated/80 border border-border/10 rounded-xl p-1.5 backdrop-blur-xl">
                <button onClick={zoomIn} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-accent transition-colors" title="Zoom In">
                    <ZoomIn className="w-4.5 h-4.5" />
                </button>
                <button onClick={zoomOut} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-accent transition-colors" title="Zoom Out">
                    <ZoomOut className="w-4.5 h-4.5" />
                </button>
                <button onClick={resetZoom} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-accent transition-colors" title="Reset view">
                    <Maximize2 className="w-4.5 h-4.5" />
                </button>
            </div>

            {/* Floating details inspection panel */}
            {selectedNode && (
                <div className="absolute top-4 right-4 z-10 w-80 max-h-[85%] bg-surface-elevated/95 border border-border/10 rounded-2xl p-5 shadow-2xl flex flex-col backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ backgroundColor: `${selectedNode.color}20`, color: selectedNode.color }}>
                                {selectedNode.type}
                            </span>
                            {selectedNode.subType && (
                                <span className="text-[9px] font-mono text-text-tertiary uppercase">{selectedNode.subType}</span>
                            )}
                        </div>
                        <button onClick={() => setSelectedNode(null)} className="p-1 rounded hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                        <h4 className="text-sm font-bold text-text-primary break-words font-mono">{selectedNode.label}</h4>
                        
                        {selectedNode.type === 'entity' && (
                            <div className="space-y-3 font-mono text-xs">
                                {selectedNode.details.confidence && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-tertiary">CONFIDENCE:</span>
                                        <span className={selectedNode.details.confidence >= 80 ? 'text-success font-black' : 'text-accent font-black'}>
                                            {selectedNode.details.confidence}% SIGNAL
                                        </span>
                                    </div>
                                )}
                                {selectedNode.details.notes && (
                                    <div className="space-y-1">
                                        <span className="text-text-tertiary text-[10px]">ANALYSIS NOTES:</span>
                                        <p className="text-text-secondary leading-relaxed bg-foreground/[0.02] p-2.5 rounded-lg border border-white/5 text-[11px] font-sans">
                                            {selectedNode.details.notes}
                                        </p>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <a
                                        href={`/dashboard/investigations/new?target=${encodeURIComponent(selectedNode.label)}`}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-accent text-white font-black text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all shadow-glow-cyan-sm"
                                    >
                                        <Zap className="w-3.5 h-3.5" /> Pivot Search
                                    </a>
                                </div>
                            </div>
                        )}

                        {selectedNode.type === 'evidence' && (
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between font-mono">
                                    <span className="text-text-tertiary">CONFIDENCE:</span>
                                    <span className={`font-black ${selectedNode.details.confidenceLabel === 'HIGH' ? 'text-success' : 'text-accent'}`}>
                                        {selectedNode.details.confidenceLabel || 'MEDIUM'} ({Math.round((selectedNode.details.confidenceScore || 0.5) * 100)}%)
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-text-tertiary font-mono text-[10px]">EXTRACTED EVIDENCE:</span>
                                    <p className="text-text-secondary leading-relaxed bg-foreground/[0.02] p-2.5 rounded-lg border border-white/5 max-h-36 overflow-y-auto no-scrollbar font-mono text-[11px]">
                                        {selectedNode.details.content}
                                    </p>
                                </div>
                                {selectedNode.details.sourceUrl && (
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-text-tertiary font-mono">SOURCE:</span>
                                        <a href={selectedNode.details.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate max-w-[200px] font-mono">
                                            {new URL(selectedNode.details.sourceUrl).hostname}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SVG Graph rendering area */}
            <svg
                ref={svgRef}
                className="w-full h-full cursor-grab active:cursor-grabbing z-0"
                onMouseDown={handleBgMouseDown}
                onWheel={handleWheel}
            >
                <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="15" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,255,0.15)" />
                    </marker>
                    <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <style>{`
                    @keyframes edgeFlow {
                        to {
                            stroke-dashoffset: -20;
                        }
                    }
                    .edge-pulse {
                        stroke-dasharray: 4 4;
                        animation: edgeFlow 0.8s linear infinite;
                    }
                `}</style>

                {/* Viewport container */}
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                    
                    {/* Edges layer */}
                    <g>
                        {edgesState.map((edge, idx) => {
                            const sourceNode = nodesState.find(n => n.id === edge.source);
                            const targetNode = nodesState.find(n => n.id === edge.target);
                            
                            if (!sourceNode || !targetNode) return null;
                            
                            const isEdgeHighlighted = hoveredNodeId === edge.source || hoveredNodeId === edge.target;
                            const isAnyNodeHovered = hoveredNodeId !== null;
                            const isEdgeFaded = isAnyNodeHovered && !isEdgeHighlighted;
                            
                            return (
                                <g key={`edge-group-${idx}`} className="transition-all duration-300">
                                    <line
                                        x1={sourceNode.x}
                                        y1={sourceNode.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke="transparent"
                                        strokeWidth={8}
                                        className="cursor-pointer"
                                    />
                                    <line
                                        x1={sourceNode.x}
                                        y1={sourceNode.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke={isEdgeHighlighted ? edge.color.replace('0.15', '0.6').replace('0.05', '0.6').replace('0.08', '0.6') : (isEdgeFaded ? 'rgba(255,255,255,0.02)' : edge.color)}
                                        strokeWidth={isEdgeHighlighted ? 2 : 1}
                                        className="transition-colors duration-300"
                                        markerEnd="url(#arrowhead)"
                                    />
                                    {(isEdgeHighlighted || edge.type === 'mention' || edge.type === 'provenance') && !isEdgeFaded && (
                                        <line
                                            x1={sourceNode.x}
                                            y1={sourceNode.y}
                                            x2={targetNode.x}
                                            y2={targetNode.y}
                                            stroke={edge.type === 'provenance' ? '#00ffc8' : (edge.type === 'mention' ? '#fb923c' : '#38bdf8')}
                                            strokeWidth={1.5}
                                            opacity={0.6}
                                            className="edge-pulse"
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* Nodes layer */}
                    <g>
                        {nodesState.map((node) => {
                            const IconComponent = node.icon;
                            const faded = isFaded(node.id);
                            const isSelected = selectedNode?.id === node.id;
                            const isHovered = hoveredNodeId === node.id;
                            
                            return (
                                <g
                                    key={node.id}
                                    transform={`translate(${node.x}, ${node.y})`}
                                    className={`transition-all duration-300 ${faded ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}
                                    onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                                    onMouseEnter={() => setHoveredNodeId(node.id)}
                                    onMouseLeave={() => setHoveredNodeId(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(node);
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (node.type === 'entity') {
                                            window.location.href = `/dashboard/investigations/new?target=${encodeURIComponent(node.label)}`;
                                        }
                                    }}
                                >
                                    {node.id === 'target' && (
                                        <circle
                                            r={node.radius + 15}
                                            fill="transparent"
                                            stroke="#00ffc8"
                                            strokeWidth={1}
                                            opacity={0.3}
                                            className="animate-ping"
                                        />
                                    )}
                                    
                                    {(isSelected || isHovered) && (
                                        <circle
                                            r={node.radius + 6}
                                            fill="transparent"
                                            stroke={node.color}
                                            strokeWidth={2}
                                            opacity={0.5}
                                            filter="url(#glow-cyan)"
                                            className="animate-pulse"
                                        />
                                    )}

                                    <circle
                                        r={node.radius}
                                        fill="#0b0f19"
                                        stroke={node.color}
                                        strokeWidth={isSelected ? 3 : 1.5}
                                        className="cursor-pointer shadow-lg hover:brightness-125 transition-all duration-200"
                                    />
                                    
                                    <circle
                                        r={node.radius - 2}
                                        fill={`radial-gradient(circle, ${node.color}25 0%, transparent 80%)`}
                                        pointerEvents="none"
                                    />

                                    <g transform={`translate(-8, -8)`} className="pointer-events-none" style={{ color: node.color }}>
                                        <IconComponent className="w-4.5 h-4.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                                    </g>

                                    <text
                                        y={node.radius + 14}
                                        textAnchor="middle"
                                        fill={isSelected ? '#ffffff' : '#94a3b8'}
                                        className="text-[9px] font-mono select-none pointer-events-none font-bold uppercase tracking-wider bg-black/40 px-1 py-0.5 rounded"
                                    >
                                        {node.label.length > 15 ? node.label.slice(0, 12) + '...' : node.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </g>
            </svg>

            {/* Dynamic visual hints overlay */}
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none font-mono text-[8px] text-text-tertiary/60 text-right space-y-0.5 bg-black/30 p-2 rounded-lg backdrop-blur-sm">
                <div>DRAG NODES TO ORGANIZE</div>
                <div>SCROLL TO ZOOM · DRAG BG TO PAN</div>
                <div>DOUBLE-CLICK ENTITY TO DEPLOY SWEEP</div>
            </div>
        </div>
    );
}
