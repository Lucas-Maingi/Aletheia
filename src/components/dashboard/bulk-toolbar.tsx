"use client";

import { Trash2, Archive, X, Loader2, CheckSquare, Square, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkToolbarProps {
    selectedCount: number;
    onClear: () => void;
    onAction: (action: 'delete' | 'archive' | 'close') => Promise<void>;
}

export function BulkToolbar({ selectedCount, onClear, onAction }: BulkToolbarProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (action: 'delete' | 'archive' | 'close') => {
        if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedCount} investigations? This action is IRREVERSIBLE.`)) {
            return;
        }

        setLoading(action);
        try {
            await onAction(action);
        } finally {
            setLoading(null);
        }
    };

    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
                >
                    <div className="bg-surface/90 backdrop-blur-xl border border-border/20 rounded-2xl shadow-3xl p-4 flex items-center justify-between gap-4 ring-1 ring-white/5">
                        <div className="flex items-center gap-3">
                            <div className="bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-xs font-black font-mono flex items-center gap-2 border border-accent/20">
                                <CheckSquare className="w-3.5 h-3.5" />
                                {selectedCount} SELECTED
                            </div>
                            <button 
                                onClick={onClear} 
                                className="text-text-tertiary hover:text-accent transition-colors p-1"
                                title="Clear Selection"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleAction('archive')}
                                disabled={!!loading}
                                className="border-border/10 bg-background/40 hover:bg-background/60 h-9"
                            >
                                {loading === 'archive' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5 mr-2 text-yellow-500" />}
                                Archive
                            </Button>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleAction('delete')}
                                disabled={!!loading}
                                className="border-error/20 bg-error/5 hover:bg-error/10 h-9 text-error hover:text-error/80"
                            >
                                {loading === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
                                Delete
                            </Button>

                            <div className="w-px h-6 bg-border/20 mx-1" />

                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {}} // Sharing placeholder
                                className="border-border/10 bg-background/40 hover:bg-background/60 h-9"
                            >
                                <Share2 className="w-3.5 h-3.5 mr-2 text-accent" />
                                Share
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
