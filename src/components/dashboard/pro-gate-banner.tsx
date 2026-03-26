"use client";

import { motion } from "framer-motion";
import { Zap, Lock, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

interface ProGateBannerProps {
    currentCount: number;
    freeLimit: number;
    isPro: boolean;
}

export function ProGateBanner({ currentCount, freeLimit, isPro }: ProGateBannerProps) {
    if (isPro) return null;

    const remaining = Math.max(0, freeLimit - currentCount);
    const usagePercent = Math.min(100, (currentCount / freeLimit) * 100);
    const isAtLimit = currentCount >= freeLimit;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl border p-4 mb-6 ${
                isAtLimit
                    ? 'bg-danger/5 border-danger/30'
                    : 'bg-surface border-border/10'
            }`}
        >
            {/* Background pulse for limit-hit state */}
            {isAtLimit && (
                <div className="absolute inset-0 bg-danger/5 animate-pulse pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAtLimit ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
                        {isAtLimit ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="text-[11px] font-black text-text-primary uppercase tracking-widest mb-1">
                            {isAtLimit ? '⚠ Investigation Limit Reached' : 'Analyst Plan'}
                        </div>
                        <div className="text-xs text-text-secondary">
                            {isAtLimit
                                ? 'You\'ve used all 5 free investigations. Upgrade to run unlimited scans.'
                                : `${remaining} of ${freeLimit} free investigations remaining this month.`
                            }
                        </div>

                        {/* Usage Bar */}
                        <div className="mt-3 w-48 sm:w-64 bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${isAtLimit ? 'bg-danger' : usagePercent > 60 ? 'bg-yellow-400' : 'bg-accent'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${usagePercent}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                        <div className="mt-1 text-[9px] font-mono text-text-tertiary">
                            {currentCount}/{freeLimit} INVESTIGATIONS USED
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block text-right">
                        <div className="text-[10px] font-black text-accent uppercase tracking-widest">Tactical Pro</div>
                        <div className="text-lg font-black text-text-primary">$99<span className="text-xs text-text-tertiary font-medium">/mo</span></div>
                        <div className="text-[9px] text-success font-bold">7-Day Free Trial</div>
                    </div>
                    <Link href="/pricing" className="block">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-black text-[11px] uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-shadow"
                        >
                            {isAtLimit ? <Lock className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                            Upgrade to Pro
                            <ArrowRight className="w-3.5 h-3.5" />
                        </motion.div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
