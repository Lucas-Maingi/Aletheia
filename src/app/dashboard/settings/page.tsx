"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle2, AlertCircle, User as UserIcon, CreditCard, Activity, ExternalLink, Brain, Database, X, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsageStats } from "@/components/dashboard/usage-stats";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("identity");
    const [isSaving, setIsSaving] = useState(false);
    const [usage, setUsage] = useState<any>(null);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        avatarUrl: "",
        plan: "free"
    });
    const [isLoading, setIsLoading] = useState(true);

    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        document.title = "Settings — Aletheia";
    }, []);

    // Detect recovery mode from URL (password reset link click)
    useEffect(() => {
        const resetParam = searchParams.get('reset');
        if (resetParam === 'true') {
            setIsRecoveryMode(true);
            setShowPasswordModal(true);
            setActiveTab("security");
        }
    }, [searchParams]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Usage & Profile data
                const response = await fetch('/api/user/usage');
                const data = await response.json();
                
                if (!data.error) {
                    setUsage(data);
                    setProfile({
                        name: data.name || "",
                        email: data.email || "",
                        avatarUrl: data.avatarUrl || "",
                        plan: data.plan || "free"
                    });
                }
            } catch (err) {
                console.error("Failed to load settings data", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    avatarUrl: profile.avatarUrl
                })
            });
            
            if (res.ok) {
                toast.success("Identity profile updated successfully.");
                // Dispatch event to update layout header nav profile details
                window.dispatchEvent(new CustomEvent('ale-user-profile-updated', { 
                    detail: { name: profile.name, avatarUrl: profile.avatarUrl } 
                }));
            } else {
                toast.error("Failed to sync identity profile.");
            }
        } catch (err) {
            toast.error("Protocol error during profile sync.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 800KB for base64 database compatibility)
        if (file.size > 800 * 1024) {
            toast.error("Image is too large. Maximum size is 800KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile(prev => ({
                ...prev,
                avatarUrl: reader.result as string
            }));
            toast.success("Avatar image loaded. Click 'Save Identity Changes' to persist.");
        };
        reader.readAsDataURL(file);
    };

    const handlePasswordChange = async () => {
        setPasswordError(null);
        
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        setPasswordLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                setPasswordError(error.message);
            } else {
                toast.success("Password updated successfully. Your new credentials are now active.");
                setShowPasswordModal(false);
                setNewPassword("");
                setConfirmNewPassword("");
                setShowNewPassword(false);
                setShowConfirmNewPassword(false);
                setIsRecoveryMode(false);
                
                // Clean URL if we came from recovery
                if (searchParams.get('reset') === 'true') {
                    window.history.replaceState({}, '', '/dashboard/settings');
                }
            }
        } catch (err) {
            setPasswordError("An unexpected error occurred. Please try again.");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsSaving(true);
        try {
            await supabase.auth.signOut();
            toast.success("Session terminated. Logging out...");
            window.location.href = '/auth/login';
        } catch (err) {
            toast.error("Logout protocol failed.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-8 h-8 text-accent animate-pulse" />
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/50 animate-pulse">Syncing_Identity...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20 pt-4">
            {/* Minimal System Header */}
            <div className="space-y-2 border-b border-border/10 pb-10">
                <div className="flex items-center gap-3 text-accent mb-2">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Aletheia_System_Node</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-text-primary uppercase italic">Settings</h1>
                <p className="text-xs text-text-tertiary font-medium max-w-2xl leading-relaxed uppercase tracking-wider">
                    Manage your identity profile, resource consumption quotas, and account security.
                </p>
            </div>             <Tabs defaultValue="identity" value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-foreground/[0.03] border border-border/10 w-full overflow-x-auto no-scrollbar flex rounded-2xl h-14 p-1.5 gap-2 shadow-inner">
                    {[
                        { id: "identity", label: "Identity Profile", icon: <UserIcon className="w-3.5 h-3.5" /> },
                        { id: "quota", label: "Resource Quotas", icon: <Database className="w-3.5 h-3.5" /> },
                        { id: "security", label: "Security & Session", icon: <Shield className="w-3.5 h-3.5" /> }
                    ].map((tab) => (
                        <TabsTrigger 
                            key={tab.id}
                            value={tab.id} 
                            className="rounded-xl px-4 md:px-8 h-full shrink-0 flex items-center justify-center text-[10px] md:text-[11px] font-black uppercase tracking-widest text-text-tertiary data-[state=active]:bg-surface data-[state=active]:text-accent data-[state=active]:shadow-[0_0_15px_rgba(0,240,255,0.15)] border border-transparent data-[state=active]:border-accent/20 transition-all hover:text-text-primary gap-2 md:gap-2.5"
                        >
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Identity Profile Content */}
                <TabsContent value="identity" className="mt-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="bg-surface border border-border/10 shadow-xl rounded-3xl overflow-hidden group max-w-2xl">
                        <CardHeader className="bg-foreground/[0.02] border-b border-border/5 p-8">
                            <CardTitle className="flex items-center gap-4 text-text-primary uppercase tracking-[0.1em] text-lg font-black">
                                <UserIcon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                                Identity Profile
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-text-tertiary uppercase tracking-wider leading-relaxed pt-2">
                                Update your public display name and upload a profile photo on the Aletheia network.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <Avatar className="h-20 w-20 border-2 border-accent/20">
                                        {profile.avatarUrl ? (
                                            <AvatarImage src={profile.avatarUrl} className="object-cover" />
                                        ) : null}
                                        <AvatarFallback className="bg-accent/10 text-xl font-black text-accent uppercase">
                                            {profile.name?.substring(0, 2).toUpperCase() || profile.email?.substring(0, 2).toUpperCase() || "AN"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                        <span className="text-[9px] font-black uppercase text-white tracking-widest text-center px-1">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </label>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-text-primary uppercase">{profile.name || "Vector Analyst"}</h4>
                                    <p className="text-[10px] font-mono text-text-tertiary uppercase">{profile.email}</p>
                                    <div className="flex gap-4 pt-1">
                                        <label className="text-[10px] text-accent hover:text-accent-hover font-bold uppercase tracking-widest cursor-pointer border-b border-accent/20 hover:border-accent pb-0.5 transition-all">
                                            Upload Photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                            />
                                        </label>
                                        {profile.avatarUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setProfile(prev => ({ ...prev, avatarUrl: "" }))}
                                                className="text-[10px] text-danger hover:text-danger-hover font-bold uppercase tracking-widest cursor-pointer border-b border-danger/20 hover:border-danger pb-0.5 transition-all"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-text-tertiary tracking-[0.2em] uppercase pl-1">Display Name</Label>
                                    <Input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile(e.target.value ? { ...profile, name: e.target.value } : { ...profile, name: "" })}
                                        placeholder="Analyst Name"
                                        className="h-14 bg-foreground/[0.03] border-border/10 font-bold text-sm px-5 rounded-2xl animate-none focus:border-accent/40"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full h-14 bg-accent hover:bg-accent-hover text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all disabled:opacity-50"
                            >
                                {isSaving ? "Saving Credentials..." : "Save Identity Changes"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Quota & Billing Content */}
                <TabsContent value="quota" className="mt-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/10">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-accent">Resource Consumption</h3>
                                <p className="text-xs text-text-tertiary mt-1 font-bold uppercase tracking-wider">Monitor your real-time data ingestion and processing limits</p>
                            </div>
                            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-foreground/5 px-3 py-1.5 rounded-full w-fit">Auto-Reset: 1st of Month</span>
                        </div>
                        
                        {usage && <UsageStats data={usage} />}

                        <div className="pt-8">
                            <Card className="bg-surface border border-border/10 relative overflow-hidden shadow-2xl rounded-3xl">
                                <CardHeader className="p-8 pb-6 bg-foreground/[0.02] border-b border-border/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-xl font-black uppercase tracking-[0.1em] text-text-primary">Billing & Subscription</CardTitle>
                                            <CardDescription className="text-xs text-text-tertiary mt-2 font-bold uppercase tracking-wider">Manage your organizational subscriptions and financial records</CardDescription>
                                        </div>
                                        <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 w-fit shrink-0">
                                            <CreditCard className="w-6 h-6 text-accent" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-foreground/[0.03] rounded-3xl border border-border/5 group hover:border-accent/20 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-lg shadow-accent/10 group-hover:scale-105 transition-transform">
                                                <Brain className="w-7 h-7 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">Active Deployment Tier</p>
                                                <p className="text-lg font-black text-text-primary uppercase">{profile.plan} INVESTIGATOR</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="h-12 px-8 border-accent/20 bg-accent/5 text-accent hover:bg-accent text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                                            onClick={() => window.open('/premium', '_blank')}
                                        >
                                            Manage Subscription <ExternalLink className="w-3.5 h-3.5 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Security & Terminal Content */}
                <TabsContent value="security" className="mt-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="max-w-2xl">
                        {/* Account Actions */}
                        <Card className="bg-surface border border-border/10 shadow-xl rounded-3xl overflow-hidden group">
                            <CardHeader className="bg-foreground/[0.02] border-b border-border/5 p-8">
                                <CardTitle className="flex items-center gap-4 text-text-primary uppercase tracking-[0.1em] text-lg font-black">
                                    <Shield className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                                    Password Settings
                                </CardTitle>
                                <CardDescription className="text-xs font-bold text-text-tertiary uppercase tracking-wider leading-relaxed pt-2">
                                    Manage your authentication password and session lifetime.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                <Button 
                                    variant="outline" 
                                    className="w-full h-14 border-border/10 bg-foreground/5 hover:bg-accent/5 hover:text-accent hover:border-accent/20 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                                    onClick={() => {
                                        setShowPasswordModal(true);
                                        setPasswordError(null);
                                        setNewPassword("");
                                        setConfirmNewPassword("");
                                        setShowNewPassword(false);
                                        setShowConfirmNewPassword(false);
                                    }}
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Change Password
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="w-full h-14 text-danger hover:text-white hover:bg-danger/80 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Password Change Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
                        onClick={(e) => {
                            // Don't allow closing during recovery mode
                            if (!isRecoveryMode && e.target === e.currentTarget) {
                                setShowPasswordModal(false);
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-surface border border-border/20 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border/10 bg-foreground/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-xl border border-accent/20">
                                        <Lock className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-text-primary">
                                            {isRecoveryMode ? 'Set New Password' : 'Change Password'}
                                        </h3>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary mt-0.5">
                                            {isRecoveryMode ? 'Password recovery in progress' : 'Credential rotation protocol'}
                                        </p>
                                    </div>
                                </div>
                                {!isRecoveryMode && (
                                    <button
                                        onClick={() => setShowPasswordModal(false)}
                                        className="p-2 rounded-xl hover:bg-foreground/10 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-text-tertiary" />
                                    </button>
                                )}
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5">
                                {isRecoveryMode && (
                                    <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
                                        <p className="text-[10px] font-bold text-accent uppercase tracking-wider">
                                            You clicked a password reset link. Please choose a new password below.
                                        </p>
                                    </div>
                                )}

                                {passwordError && (
                                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl">
                                        <p className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                                            <span className="text-red-400 mr-1">ERROR:</span> {passwordError}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-text-tertiary tracking-[0.2em] uppercase pl-1">New Password</Label>
                                    <div className="relative flex items-center">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password (min. 6 chars)"
                                            autoComplete="new-password"
                                            className="h-14 w-full bg-foreground/[0.03] border-border/10 font-bold text-sm px-5 pr-12 rounded-2xl focus:border-accent/40"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 p-1 text-text-secondary hover:text-text-primary focus:outline-none transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-text-tertiary tracking-[0.2em] uppercase pl-1">Confirm New Password</Label>
                                    <div className="relative flex items-center">
                                        <Input
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                            className="h-14 w-full bg-foreground/[0.03] border-border/10 font-bold text-sm px-5 pr-12 rounded-2xl focus:border-accent/40"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                            className="absolute right-4 p-1 text-text-secondary hover:text-text-primary focus:outline-none transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password strength indicator */}
                                {newPassword.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        newPassword.length < 6 ? 'w-1/4 bg-red-500' :
                                                        newPassword.length < 10 ? 'w-2/4 bg-yellow-500' :
                                                        newPassword.length < 14 ? 'w-3/4 bg-accent' :
                                                        'w-full bg-green-500'
                                                    }`}
                                                />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${
                                                newPassword.length < 6 ? 'text-red-400' :
                                                newPassword.length < 10 ? 'text-yellow-400' :
                                                newPassword.length < 14 ? 'text-accent' :
                                                'text-green-400'
                                            }`}>
                                                {newPassword.length < 6 ? 'Too Short' :
                                                 newPassword.length < 10 ? 'Fair' :
                                                 newPassword.length < 14 ? 'Strong' :
                                                 'Very Strong'}
                                            </span>
                                        </div>
                                        {newPassword.length > 0 && confirmNewPassword.length > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                {newPassword === confirmNewPassword ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Passwords match</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3 h-3 text-red-400" />
                                                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Passwords do not match</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 pt-0 flex gap-3">
                                {!isRecoveryMode && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 h-12 border-border/10 font-black uppercase tracking-widest text-[10px] rounded-2xl"
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={passwordLoading || newPassword.length < 6 || newPassword !== confirmNewPassword}
                                    className={`${isRecoveryMode ? 'w-full' : 'flex-1'} h-12 bg-accent hover:bg-accent-hover text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all disabled:opacity-50`}
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
