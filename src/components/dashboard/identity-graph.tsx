"use client";

import { motion } from "framer-motion";
import { 
  Building2, Globe, FileText, User, MapPin, 
  Smartphone, Briefcase, Mail, Key, Shield, Hash,
  Database, Network, Crosshair, GitBranch, CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";

// Helper to determine icon based on category/platform
const getIcon = (category: string, platform: string) => {
    const c = category.toLowerCase();
    const p = platform.toLowerCase();
    if (c === 'social' || p.includes('instagram') || p.includes('linkedin')) return User;
    if (c === 'breach' || p.includes('pastebin')) return Database;
    if (c === 'identity' || p.includes('email')) return Mail;
    if (c === 'infrastructure' || p.includes('domain')) return Globe;
    if (c === 'crypto') return Hash;
    if (p.includes('github') || p.includes('code')) return FileText;
    return Network;
};

const getPlatformColor = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('github')) return 'text-text-primary border-white/20 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]';
    if (p.includes('instagram')) return 'text-pink-400 border-pink-400/20 bg-pink-400/5 shadow-[0_0_15px_rgba(244,114,182,0.1)]';
    if (p.includes('linkedin')) return 'text-text-secondary border-blue-400/20 bg-blue-400/5 shadow-[0_0_15px_rgba(96,165,250,0.1)]';
    if (p.includes('spotify')) return 'text-green-400 border-green-400/20 bg-green-400/5 shadow-[0_0_15px_rgba(74,222,128,0.1)]';
    if (p.includes('yahoo')) return 'text-purple-400 border-purple-400/20 bg-purple-400/5 shadow-[0_0_15px_rgba(192,132,252,0.1)]';
    if (p.includes('leak') || p.includes('breach') || p.includes('emailrep')) return 'text-danger border-danger/20 bg-danger/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
    return 'text-accent border-accent/20 bg-accent/5 shadow-[0_0_15px_rgba(0,255,200,0.1)]';
};

const getProvenanceColor = (source: string) => {
    if (!source) return '#ffffff20';
    if (source.includes('Breach') || source.includes('Leak')) return '#f43f5e60';
    if (source.includes('GitHub')) return '#ffffff40';
    if (source.includes('EmailRep') || source.includes('Registry')) return '#00ffc860';
    if (source.includes('Gravatar')) return '#60a5fa60';
    return '#ffffff20';
};

export function IdentityGraph({ target, evidence }: { target: string, evidence: any[] }) {
    const nodes = evidence
        .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
        .slice(0, 25);
        
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => setMounted(true), []);

    if (!mounted) return (
        <div className="h-[500px] w-full bg-surface border border-white/5 animate-pulse rounded-2xl flex items-center justify-center flex-col gap-4">
            <Network className="w-8 h-8 text-text-primary/20 animate-spin-slow" />
            <div className="text-xs font-mono text-text-tertiary">INITIALIZING GRAPH ENGINE...</div>
        </div>
    );

    if (nodes.length === 0) return null;

    return (
        <div className="relative w-full h-[500px] bg-background/50 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            {/* SVG Link Map — with provenance edge labels */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,255,0.15)" />
                    </marker>
                </defs>
                {nodes.map((node, i) => {
                    const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                    const radius = 180; 
                    const x2Num = Math.cos(angle) * radius;
                    const y2Num = Math.sin(angle) * radius;
                    const x2 = `calc(50% + ${x2Num}px)`;
                    const y2 = `calc(50% + ${y2Num}px)`;
                    const isHovered = hoveredNode === node.id;
                    const isFaded = hoveredNode && !isHovered;
                    const provenanceSource = node.metadata?.provenanceSource || node.metadata?.provenanceSource || '';
                    const edgeColor = getProvenanceColor(provenanceSource);

                    // Midpoint for label
                    const midX = `calc(50% + ${x2Num * 0.52}px)`;
                    const midY = `calc(50% + ${y2Num * 0.52}px)`;

                    return (
                        <g key={`line-group-${node.id}`}>
                            <motion.line
                                key={`line-${node.id}`}
                                x1="50%"
                                y1="50%"
                                x2={x2}
                                y2={y2}
                                stroke={isHovered ? edgeColor : "rgba(255,255,255,0.07)"}
                                strokeWidth={isHovered ? 2 : 1}
                                strokeDasharray={provenanceSource ? "none" : "4 4"}
                                markerEnd={isHovered ? "url(#arrowhead)" : "none"}
                                className="transition-colors duration-300"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: isFaded ? 0.05 : 0.7 }}
                                transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                            />
                            {/* Provenance Edge Label — only shows on hover */}
                            {isHovered && provenanceSource && (
                                <foreignObject
                                    x={midX}
                                    y={midY}
                                    width="120"
                                    height="20"
                                    style={{ transform: 'translate(-60px, -10px)', overflow: 'visible' }}
                                >
                                    <div
                                        style={{
                                            background: 'rgba(0,0,0,0.8)',
                                            border: `1px solid ${edgeColor}`,
                                            borderRadius: '4px',
                                            padding: '2px 6px',
                                            fontSize: '8px',
                                            color: 'rgba(255,255,255,0.7)',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'nowrap',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {provenanceSource}
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Central Intelligence Node */}
            <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-crosshair group"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                onMouseEnter={() => setHoveredNode('CENTER')}
                onMouseLeave={() => setHoveredNode(null)}
            >
                <div className="w-20 h-20 rounded-full bg-surface border-2 border-accent shadow-xl flex items-center justify-center z-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/20 transition-all duration-700" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] animate-pulse" style={{ '--color-accent': '#00f0ff' } as any} />
                    <Crosshair className="w-8 h-8 text-accent drop-shadow-[0_0_12px_#00f0ff] group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="mt-5 bg-surface-elevated px-5 py-2.5 rounded-xl border border-accent/30 text-[10px] font-bold text-text-primary shadow-xl text-center max-w-[240px] truncate uppercase tracking-widest italic group-hover:border-accent transition-colors">
                    SUBJECT: {target}
                </div>
            </motion.div>

            {/* Sub-Network Satellites */}
            {nodes.map((node, i) => {
                const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                const radius = 180;
                
                const NodeIcon = getIcon(node.category, node.platform);
                const colorConfig = getPlatformColor(node.platform);
                const isHovered = hoveredNode === node.id;
                const isFaded = hoveredNode && !isHovered && hoveredNode !== 'CENTER';

                const isRightSide = Math.cos(angle) > 0;
                const isBottomHalf = Math.sin(angle) > 0;

                const provenanceSource = node.metadata?.provenanceSource || '';
                const isPivotable = node.metadata?.pivotable === true;
                const extractedUsername = node.metadata?.username;

                return (
                    <motion.div
                        key={node.id}
                        className={`absolute z-10 cursor-pointer ${isFaded ? 'opacity-30 blur-[1px] grayscale' : 'opacity-100'} transition-all duration-300`}
                        style={{
                            x: Math.cos(angle) * radius,
                            y: Math.sin(angle) * radius,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: isFaded ? 0.3 : 1, scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1), type: "spring", bounce: 0.4 }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                    >
                        <div className={`w-12 h-12 rounded-full border ${colorConfig} flex items-center justify-center backdrop-blur-md relative transition-transform duration-300 ${isHovered ? 'scale-125 z-50 ring-2 ring-white/20' : ''}`}>
                            <NodeIcon className="w-5 h-5" />
                            
                            {/* Pivotable indicator dot */}
                            {isPivotable && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-background shadow-[0_0_6px_#00ffc8]" title="Pivot available" />
                            )}
                            
                            {/* Proximity Intelligence Tooltip */}
                            {isHovered && (
                                <motion.div 
                                    initial={{ opacity: 0, y: isBottomHalf ? -10 : 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`absolute ${isBottomHalf ? 'bottom-full mb-4' : 'top-full mt-4'} ${isRightSide ? 'right-0' : 'left-0'} w-72 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl z-50 pointer-events-none`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.2em]">{node.platform}</div>
                                        <div className={`text-[10px] px-2 py-0.5 rounded pl-1 bg-white/5 border border-white/10 font-bold ${node.confidenceScore > 0.9 ? 'text-success' : 'text-accent-blue'}`}>
                                            {Math.round(node.confidenceScore * 100)}% MATCH
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-text-primary mb-2 leading-tight">{node.title}</div>
                                    <div className="text-xs text-text-secondary line-clamp-4 leading-relaxed tracking-wide">
                                        {node.description?.replace(/\[PIVOT_HINT:.*?\]/g, '').replace(/###.*?\n/g, '').replace(/\*\*/g, '').trim().slice(0, 200)}
                                    </div>
                                    
                                    {/* Provenance Path */}
                                    {provenanceSource && (
                                        <div className="mt-3 flex items-center gap-1.5 text-[9px] font-mono text-accent/80">
                                            <GitBranch className="w-3 h-3" />
                                            <span>Linked {provenanceSource}</span>
                                        </div>
                                    )}

                                    {/* Extracted Username Pivot */}
                                    {extractedUsername && (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-mono text-success/80">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Pivot Ready: @{extractedUsername}</span>
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-text-muted">
                                        <span>Category: {node.category}</span>
                                        <span className={`flex items-center gap-1 font-mono ${isPivotable ? 'text-accent' : 'text-text-primary/40'}`}>
                                            <Network className="w-3 h-3" />
                                            {isPivotable ? 'Node Pivotable' : 'Node Active'}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// Helper to determine icon based on category/platform
const getIcon = (category: string, platform: string) => {
    const c = category.toLowerCase();
    const p = platform.toLowerCase();
    if (c === 'social' || p.includes('instagram') || p.includes('linkedin')) return User;
    if (c === 'breach' || p.includes('pastebin')) return Database;
    if (c === 'identity' || p.includes('email')) return Mail;
    if (c === 'infrastructure' || p.includes('domain')) return Globe;
    if (c === 'crypto') return Hash;
    if (p.includes('github') || p.includes('code')) return FileText;
    return Network;
};

const getPlatformColor = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('github')) return 'text-text-primary border-white/20 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]';
    if (p.includes('instagram')) return 'text-pink-400 border-pink-400/20 bg-pink-400/5 shadow-[0_0_15px_rgba(244,114,182,0.1)]';
    if (p.includes('linkedin')) return 'text-text-secondary border-blue-400/20 bg-blue-400/5 shadow-[0_0_15px_rgba(96,165,250,0.1)]';
    if (p.includes('spotify')) return 'text-green-400 border-green-400/20 bg-green-400/5 shadow-[0_0_15px_rgba(74,222,128,0.1)]';
    if (p.includes('yahoo')) return 'text-purple-400 border-purple-400/20 bg-purple-400/5 shadow-[0_0_15px_rgba(192,132,252,0.1)]';
    if (p.includes('leak') || p.includes('breach')) return 'text-danger border-danger/20 bg-danger/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
    return 'text-accent border-accent/20 bg-accent/5 shadow-[0_0_15px_rgba(0,255,200,0.1)]';
};

export function IdentityGraph({ target, evidence }: { target: string, evidence: any[] }) {
    // Only map the most confident, distinct nodes to prevent clutter
    const nodes = evidence
        .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
        .slice(0, 25);
        
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    
    // Prevent hydration mismatch purely rendering post-mount
    useEffect(() => setMounted(true), []);

    if (!mounted) return (
        <div className="h-[500px] w-full bg-surface border border-white/5 animate-pulse rounded-2xl flex items-center justify-center flex-col gap-4">
            <Network className="w-8 h-8 text-text-primary/20 animate-spin-slow" />
            <div className="text-xs font-mono text-text-tertiary">INITIALIZING GRAPH ENGINE...</div>
        </div>
    );

    if (nodes.length === 0) return null;

    return (
        <div className="relative w-full h-[500px] bg-background/50 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            {/* SVG Link Map */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {nodes.map((node, i) => {
                    const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                    // Dynamically calculate responsive radius if necessary, hardcoding 180px for standard 500px height box
                    const radius = 180; 
                    
                    const x2 = `calc(50% + ${Math.cos(angle) * radius}px)`;
                    const y2 = `calc(50% + ${Math.sin(angle) * radius}px)`;
                    const isHovered = hoveredNode === node.id;
                    const isFaded = hoveredNode && !isHovered;

                    return (
                        <motion.line
                            key={`line-${node.id}`}
                            x1="50%"
                            y1="50%"
                            x2={x2}
                            y2={y2}
                            stroke={isHovered ? "var(--color-accent, #00ffc8)" : "rgba(255,255,255,0.08)"}
                            strokeWidth={isHovered ? 2 : 1}
                            className="transition-colors duration-300 print:stroke-slate-300"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: isFaded ? 0.1 : 0.8 }}
                            transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                        />
                    );
                })}
            </svg>

            {/* Central Intelligence Node */}
            <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-crosshair group"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                onMouseEnter={() => setHoveredNode('CENTER')}
                onMouseLeave={() => setHoveredNode(null)}
            >
                <div className="w-20 h-20 rounded-full bg-surface border-2 border-accent shadow-xl flex items-center justify-center z-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/20 transition-all duration-700" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] animate-pulse" style={{ '--color-accent': '#00f0ff' } as any} />
                    <Crosshair className="w-8 h-8 text-accent drop-shadow-[0_0_12px_#00f0ff] group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="mt-5 bg-surface-elevated px-5 py-2.5 rounded-xl border border-accent/30 text-[10px] font-bold text-text-primary shadow-xl text-center max-w-[240px] truncate uppercase tracking-widest italic group-hover:border-accent transition-colors">
                    SUBJECT: {target}
                </div>
            </motion.div>

            {/* Sub-Network Satellites */}
            {nodes.map((node, i) => {
                const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                const radius = 180;
                
                const NodeIcon = getIcon(node.category, node.platform);
                const colorConfig = getPlatformColor(node.platform);
                const isHovered = hoveredNode === node.id;
                const isFaded = hoveredNode && !isHovered && hoveredNode !== 'CENTER';

                // Determine tooltip placement based on angle to keep it on-screen
                const isRightSide = Math.cos(angle) > 0;
                const isBottomHalf = Math.sin(angle) > 0;

                return (
                    <motion.div
                        key={node.id}
                        className={`absolute z-10 cursor-pointer ${isFaded ? 'opacity-30 blur-[1px] grayscale' : 'opacity-100'} transition-all duration-300`}
                        style={{
                            x: Math.cos(angle) * radius,
                            y: Math.sin(angle) * radius,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: isFaded ? 0.3 : 1, scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1), type: "spring", bounce: 0.4 }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                    >
                        <div className={`w-12 h-12 rounded-full border ${colorConfig} flex items-center justify-center backdrop-blur-md relative transition-transform duration-300 ${isHovered ? 'scale-125 z-50 ring-2 ring-white/20' : ''}`}>
                            <NodeIcon className="w-5 h-5" />
                            
                            {/* Proximity Intelligence Tooltip */}
                            {isHovered && (
                                <motion.div 
                                    initial={{ opacity: 0, y: isBottomHalf ? -10 : 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`absolute ${isBottomHalf ? 'bottom-full mb-4' : 'top-full mt-4'} ${isRightSide ? 'right-0' : 'left-0'} w-72 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl z-50 pointer-events-none`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.2em]">{node.platform}</div>
                                        <div className={`text-[10px] px-2 py-0.5 rounded pl-1 bg-white/5 border border-white/10 font-bold ${node.confidenceScore > 0.9 ? 'text-success' : 'text-accent-blue'}`}>
                                            {Math.round(node.confidenceScore * 100)}% MATCH
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-text-primary mb-2 leading-tight">{node.title}</div>
                                    <div className="text-xs text-text-secondary line-clamp-4 leading-relaxed tracking-wide">
                                        {node.description.replace(/\[PIVOT_HINT:.*?\]/g, '')}
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-text-muted">
                                        <span>Category: {node.category}</span>
                                        <span className="flex items-center gap-1 font-mono text-text-primary/40"><Network className="w-3 h-3" /> Node Active</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
