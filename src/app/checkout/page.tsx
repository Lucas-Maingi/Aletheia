"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Lock, CheckCircle2, ArrowRight, Zap, 
  CreditCard, Loader2, AlertCircle, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LAUNCH_CONFIG } from "@/lib/launch-config";

const planDetails: Record<string, {
  name: string;
  price: number;
  originalMonthly: number;
  features: string[];
  badge: string;
  gumroadIdKey: keyof typeof LAUNCH_CONFIG.LTD_TIERS;
}> = {
  analyst_pro: {
    name: 'Analyst Pro',
    price: 299,
    originalMonthly: 99,
    badge: 'Best Value',
    gumroadIdKey: 'analyst_pro',
    features: [
      'Lifetime access to Aletheia Pro',
      'Unlimited investigations',
      '17+ OSINT connectors',
      'AI intelligence synthesis',
      'Breach database access',
      'SHA-256 evidence hashing',
      'PDF dossier export',
    ],
  },
  command_center: {
    name: 'Command Center',
    price: 599,
    originalMonthly: 249,
    badge: 'Most Popular',
    gumroadIdKey: 'command_center',
    features: [
      'Everything in Analyst Pro',
      'Facial recognition analysis',
      'Reverse image search',
      'Dark web intelligence',
      'Crypto wallet tracing',
      'Watchlists & real-time alerts',
      'Team collaboration (3 seats)',
      'API access',
    ],
  },
  agency_arsenal: {
    name: 'Agency Arsenal',
    price: 999,
    originalMonthly: 499,
    badge: 'Maximum Power',
    gumroadIdKey: 'agency_arsenal',
    features: [
      'Everything in Command Center',
      'Unlimited team seats',
      'Batch investigation processing',
      'White-label reports',
      'Custom data connectors',
      'Webhook integrations',
      'Dedicated support manager',
    ],
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "analyst_pro";
  const plan = planDetails[planId] || planDetails.analyst_pro;
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'checkout_modal'>('details');
  const yearlySavings = (plan.originalMonthly * 12) - plan.price;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setStep('processing');
    
    // Brief processing animation before showing the modal
    setTimeout(() => {
      setStep('checkout_modal');
    }, 1500);
  };

  // Listen for successful sale postMessage from Gumroad overlay
  useEffect(() => {
    const handleGumroadMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data && data.post_message_name === "sale") {
            // Purchase successful, redirect to success page
            window.location.href = `/success?plan=${planId}`;
          }
        } catch (e) {
          // Ignore unrelated JSON parse errors
        }
      }
    };

    window.addEventListener("message", handleGumroadMessage);
    return () => window.removeEventListener("message", handleGumroadMessage);
  }, [planId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border/10 bg-surface/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/pricing" className="flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Plans</span>
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-black tracking-tight text-text-primary">Aletheia</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid lg:grid-cols-5 gap-8">
          
          {/* Left: Order Summary (2 cols) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="sticky top-8 space-y-6">
              {/* Plan Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl bg-surface/60 border border-border/10 backdrop-blur-xl"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4">Order Summary</div>
                
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-text-primary">{plan.name}</h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mt-1">Lifetime Deal — One-Time Payment</div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-widest">
                    {plan.badge}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-text-secondary">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">Retail price</span>
                    <span className="text-text-tertiary line-through">${plan.originalMonthly}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">Annual equivalent</span>
                    <span className="text-text-tertiary line-through">${plan.originalMonthly * 12}/yr</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-emerald-400">You save</span>
                    <span className="text-emerald-400">${yearlySavings} in year 1</span>
                  </div>
                  <div className="pt-3 border-t border-border/10 flex justify-between items-baseline">
                    <span className="text-text-primary font-bold">Total (one-time)</span>
                    <span className="text-3xl font-black text-text-primary">${plan.price}</span>
                  </div>
                </div>
              </motion.div>

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: '30-Day Money-Back', color: 'text-emerald-400' },
                  { icon: Zap, label: 'Lifetime Updates', color: 'text-accent' },
                  { icon: Lock, label: '256-bit Encrypted', color: 'text-blue-400' },
                  { icon: CheckCircle2, label: 'Instant Access', color: 'text-purple-400' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-surface/30 border border-border/5">
                    <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Checkout Form (3 cols) */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="mb-8">
                    <h1 className="text-3xl font-black text-text-primary mb-2">Complete Your Purchase</h1>
                    <p className="text-text-secondary text-sm">Secure lifetime access to {plan.name}. No recurring charges, ever.</p>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3.5 rounded-xl bg-surface/60 border border-border/10 text-text-primary placeholder:text-text-tertiary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all text-sm font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3.5 rounded-xl bg-surface/60 border border-border/10 text-text-primary placeholder:text-text-tertiary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all text-sm font-medium"
                      />
                      <p className="text-[10px] text-text-tertiary">Your license will be sent to this email.</p>
                    </div>

                    {/* Divider */}
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px]">
                        <span className="px-3 bg-background text-text-tertiary font-bold uppercase tracking-widest">Payment via Gumroad</span>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-text-secondary font-medium">
                          You'll be securely redirected to Gumroad to complete your payment. Gumroad accepts all major credit cards, debit cards, and PayPal.
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!email || !name || !email.includes('@')}
                      className={`w-full flex items-center justify-center h-14 text-sm font-black uppercase tracking-widest rounded-2xl transition-all ${
                        email && name && email.includes('@') 
                          ? "bg-accent hover:bg-accent/90 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] transform hover:scale-[1.01]" 
                          : "bg-accent text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] opacity-70 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ${plan.price} — Lifetime Access
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>

                    <p className="text-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                      🔒 30-day money-back guarantee • Instant access after payment
                    </p>
                  </form>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
                    <Loader2 className="w-16 h-16 text-accent animate-spin relative z-10" />
                  </div>
                  <h2 className="text-2xl font-black text-text-primary mt-8 mb-2">Preparing Your Checkout</h2>
                  <p className="text-text-secondary text-sm">Redirecting you to secure payment...</p>
                </motion.div>
              )}

              {step === 'checkout_modal' && (
                <motion.div
                  key="checkout_modal"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md"
                >
                  <div className="w-full max-w-xl h-[700px] max-h-[90vh] bg-surface border border-border/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
                    <div className="flex items-center justify-between p-4 border-b border-border/10 bg-surface-elevated">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Secure Checkout</span>
                      </div>
                      <button 
                        onClick={() => setStep('details')}
                        className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex-1 w-full bg-[#f4f4f5] relative">
                      {!LAUNCH_CONFIG.LTD_TIERS[plan.gumroadIdKey]?.gumroadId ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                          <AlertCircle className="w-12 h-12 text-amber-400 mb-4" />
                          <h3 className="text-lg font-black text-black mb-2">Product Not Configured</h3>
                          <p className="text-gray-600 text-sm">Please set the gumroadId in launch-config.ts.</p>
                        </div>
                      ) : (
                        <iframe 
                          src={`https://lucas808.gumroad.com/l/${LAUNCH_CONFIG.LTD_TIERS[plan.gumroadIdKey].gumroadId}?email=${encodeURIComponent(email)}&wanted=true`}
                          className="w-full h-full border-none"
                          allow="payment"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/10 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
        © 2026 Aletheia Intelligence Systems • Secure Transaction
      </div>
    </div>
  );
}
