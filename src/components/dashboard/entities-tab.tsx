"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Globe, AtSign, Shield, Fingerprint, Zap, Car } from 'lucide-react';

export function EntitiesTab({ entities, investigationId }: { entities: any[], investigationId: string }) {
    if (entities.length === 0) {
        return (
            <Card className="border-dashed border-border-bright bg-transparent">
                <CardContent className="h-64 flex flex-col items-center justify-center text-text-tertiary p-8 text-center">
                    <div className="opacity-20 mb-4"><Users className="w-8 h-8" /></div>
                    <p className="text-sm max-w-xs leading-relaxed">No additional entities discovered from leaks or metadata yet.</p>
                </CardContent>
            </Card>
        );
    }

    const getEntityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'email': return <Mail className="w-3.5 h-3.5" />;
            case 'domain': return <Globe className="w-3.5 h-3.5" />;
            case 'username': return <AtSign className="w-3.5 h-3.5" />;
            case 'name': return <Users className="w-3.5 h-3.5" />;
            case 'plate':
            case 'vehicle': return <Car className="w-3.5 h-3.5" />;
            default: return <Fingerprint className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => {
                const isHighConfidence = entity.confidence >= 90;
                return (
                    <Card key={entity.id} className={`bg-surface border transition-all duration-500 group overflow-hidden shadow-lg ${
                        isHighConfidence ? 'border-accent/40 shadow-accent/5' : 'border-border/10 hover:border-accent/20'
                    }`}>
                        <CardContent className="p-6 relative">
                            {/* CRT Scanner effect overlay */}
                            <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700" />
                            
                            <div className={`absolute top-0 right-0 p-4 opacity-5 scale-[2.5] rotate-12 transition-all duration-700 ${
                                isHighConfidence ? 'opacity-10 text-accent blur-[1px]' : 'group-hover:opacity-10 group-hover:text-accent'
                            }`}>
                                {getEntityIcon(entity.type)}
                            </div>
                            
                            <div className="flex items-center gap-3 mb-5">
                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md shadow-lg ${
                                    isHighConfidence 
                                        ? 'bg-accent text-accent-foreground border-transparent shadow-accent/20' 
                                        : 'bg-accent/10 border-accent/30 text-accent'
                                }`}>
                                    {entity.type}
                                </Badge>
                                <div className={`flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest ${
                                    isHighConfidence ? 'text-success animate-pulse' : 'text-text-tertiary opacity-60'
                                }`}>
                                    <Shield className={`w-3 h-3 ${isHighConfidence ? 'text-success' : 'text-success/40'}`} />
                                    {entity.confidence}%_SIGNAL
                                </div>
                            </div>

                            <div className="text-sm font-mono font-black text-text-primary/90 truncate mb-1 group-hover:text-accent transition-colors leading-relaxed" title={entity.value}>
                                {entity.value}
                            </div>
                            
                            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                                <span className="text-[10px] text-text-primary/20 font-mono font-black tracking-widest uppercase">
                                    DISC_PULSE: {new Date(entity.createdAt).toISOString().substring(11, 19)}
                                </span>
                                <a 
                                    href={`/dashboard/investigations/new?target=${encodeURIComponent(entity.value)}`}
                                    className="text-[10px] text-accent hover:text-text-primary font-black uppercase tracking-[0.2em] transition-all relative group/btn flex items-center gap-2"
                                >
                                    <Zap className="w-3 h-3 group-hover:scale-125 transition-transform" />
                                    <span className="relative z-10">PIVOT_CORE</span>
                                    <div className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover/btn:w-full transition-all duration-500" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>

    );
}
