'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') ?? '/dashboard';
    const callbackError = searchParams.get('error');
    const supabase = createClient();

    // Handle errors from callback route
    useEffect(() => {
        if (callbackError) {
            setError(decodeURIComponent(callbackError));
        }
    }, [callbackError]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                router.push(next);
                router.refresh();
            }
        } else if (mode === 'signup') {
            // Password confirmation check
            if (password !== confirmPassword) {
                setError('Passwords do not match. Please re-enter.');
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                setLoading(false);
                return;
            }

            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback?next=${next}`
                }
            });

            if (error) {
                console.error('[Auth Diagnostics] Signup failure:', error);
                
                // Detailed "Database error" handling (Signup Safety Net)
                if (error.message.includes('Database error')) {
                    setError("Database Sync Failure: Your account was created, but failed to connect to the profile database. Please try to 'Sign In' directly with these credentials. If that fails, contact Lucas for a manual sync.");
                } else {
                    setError(error.message);
                }
            } else if (data.user && data.session === null) {
                setSuccessMessage("A verification link has been sent to your email. Please check your inbox (and spam folder) and click the link to activate your account.");
            } else {
                router.push(next);
                router.refresh();
            }
            setLoading(false);
        } else if (mode === 'forgot') {
            // Forgot Password flow
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/dashboard/settings?reset=true`
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccessMessage("Password reset link sent! Check your email inbox (and spam folder). Click the link to set a new password.");
            }
            setLoading(false);
        }
    };

    const getHeadingText = () => {
        switch (mode) {
            case 'login': return 'Secure Terminal Access';
            case 'signup': return 'Create Analyst Account';
            case 'forgot': return 'Password Recovery Protocol';
        }
    };

    const getButtonText = () => {
        if (loading) return 'Processing...';
        switch (mode) {
            case 'login': return 'Sign In';
            case 'signup': return 'Create Account';
            case 'forgot': return 'Send Reset Link';
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden p-6">
            {/* Background enhancement */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent-blue-dim)_0%,_transparent_70%)] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                <div className="panel-glass border border-border-bright/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 space-y-10 rounded-2xl">
                    <div className="text-center space-y-3">
                        <motion.h1 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-mono text-glow-blue tracking-tight font-bold"
                        >
                            Aletheia
                        </motion.h1>
                        <AnimatePresence mode="wait">
                            <motion.p 
                                key={mode}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted font-semibold"
                            >
                                {getHeadingText()}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    <form className="space-y-6" onSubmit={handleAuth}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 text-xs bg-red-950/30 border border-red-500/40 text-red-200 rounded-lg font-mono leading-relaxed"
                                >
                                    <span className="text-red-400 font-bold mr-2">ERROR_SIG:</span>{error}
                                </motion.div>
                            )}

                            {successMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 text-xs bg-accent-blue/10 border border-accent-blue/40 text-accent-blue-bright rounded-lg font-mono"
                                >
                                    <span className="text-accent-blue-bright font-bold mr-2">VERIFY:</span>{successMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest text-text-secondary font-bold font-mono ml-1">Identity (Email)</label>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-surface-dark/50 border border-border-bright focus:border-accent-blue-bright focus:ring-1 focus:ring-accent-blue-bright/30 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-text-muted font-mono"
                                    placeholder="analyst@domain.com"
                                />
                            </div>

                            {/* Password field - hidden in forgot mode */}
                            <AnimatePresence mode="wait">
                                {mode !== 'forgot' && (
                                    <motion.div
                                        key="password-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1.5 overflow-hidden"
                                    >
                                        <label className="text-[9px] uppercase tracking-widest text-text-secondary font-bold font-mono ml-1">Access Key (Password)</label>
                                        <input
                                            type="password"
                                            name="password"
                                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-surface-dark/50 border border-border-bright focus:border-accent-blue-bright focus:ring-1 focus:ring-accent-blue-bright/30 rounded-xl px-4 py-3 text-sm outline-none transition-all font-mono"
                                            placeholder="••••••••••••"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Confirm Password field - only in signup mode */}
                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        key="confirm-password-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1.5 overflow-hidden"
                                    >
                                        <label className="text-[9px] uppercase tracking-widest text-text-secondary font-bold font-mono ml-1">Confirm Access Key</label>
                                        <input
                                            type="password"
                                            name="confirm-password"
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-surface-dark/50 border border-border-bright focus:border-accent-blue-bright focus:ring-1 focus:ring-accent-blue-bright/30 rounded-xl px-4 py-3 text-sm outline-none transition-all font-mono"
                                            placeholder="••••••••••••"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="pt-4 space-y-6">
                            <motion.button
                                whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(59, 130, 246, 0.3)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent-blue hover:bg-accent-blue-bright text-white text-[11px] uppercase tracking-[0.2em] font-black py-4 rounded-xl cursor-pointer transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {getButtonText()}
                            </motion.button>

                            {/* Forgot Password link (login mode only) */}
                            {mode === 'login' && (
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode('forgot');
                                            setError(null);
                                            setSuccessMessage(null);
                                        }}
                                        className="text-[10px] uppercase tracking-widest text-text-muted hover:text-accent-blue-bright transition-colors cursor-pointer font-semibold"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <div className="text-center">
                                {mode === 'forgot' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode('login');
                                            setError(null);
                                            setSuccessMessage(null);
                                        }}
                                        className="text-[10px] uppercase tracking-widest text-text-secondary hover:text-accent-blue-bright transition-colors cursor-pointer font-bold border-b border-transparent hover:border-accent-blue-bright pb-0.5"
                                    >
                                        Back to Sign In
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode(mode === 'login' ? 'signup' : 'login');
                                            setError(null);
                                            setSuccessMessage(null);
                                            setConfirmPassword('');
                                        }}
                                        className="text-[10px] uppercase tracking-widest text-text-secondary hover:text-accent-blue-bright transition-colors cursor-pointer font-bold border-b border-transparent hover:border-accent-blue-bright pb-0.5"
                                    >
                                        {mode === 'login' ? "Need an analyst account? Sign Up" : "Already have an account? Sign In"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
