"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId = searchParams.get('sale_id');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-3xl bg-surface/40 border border-success/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-success/5 animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6 shadow-glow">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4 italic">
            Access Granted
          </h1>
          
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            Your payment was successful. The Aletheia Intelligence Engine has provisioned your lifetime clearance. 
            {saleId && <span className="block mt-2 text-[10px] text-text-tertiary font-mono">Sale Ref: {saleId}</span>}
          </p>

          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full h-14 bg-accent hover:bg-accent-hover text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-transform hover:scale-[1.02]"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuccessContent />
    </Suspense>
  );
}
