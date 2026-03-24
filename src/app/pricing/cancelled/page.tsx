"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-3xl bg-surface/40 border border-danger/20 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-danger" />
          </div>
          
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4 italic">
            Clearance Denied
          </h1>
          
          <p className="text-sm text-text-secondary leading-relaxed mb-8">
            The transaction was cancelled or declined. Your account remains active on the current tier. No charges were made.
          </p>

          <Button 
            onClick={() => router.push('/pricing')}
            variant="outline"
            className="w-full h-14 bg-surface-elevated hover:bg-white hover:text-background border-border/10 text-text-primary rounded-2xl font-black uppercase tracking-widest text-xs transition-transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Pricing
          </Button>
        </div>
      </div>
    </div>
  );
}
