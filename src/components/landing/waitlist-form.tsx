'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function WaitlistForm() {
  const [emailToken, setEmailToken] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl bg-surface border-2 border-accent/30 w-full text-center shadow-glow-sm"
      >
        <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter mb-2">Priority Secured.</h3>
        <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">A confirmation packet has been dispatched to {emailToken}. See you soon.</p>
      </motion.div>
    );
  }

  return (
    <form 
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await fetch('/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailToken })
          });
        } catch (err) {
          console.error("Waitlist submit error:", err);
        }
        setSubmitted(true);
      }}
      className="relative w-full group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
      <div className="relative flex flex-col sm:flex-row p-1.5 bg-surface border border-border/20 rounded-2xl shadow-2xl gap-2">
        <input 
          type="email" 
          required 
          placeholder="agency-email@domain.com" 
          className="flex-1 bg-transparent px-5 py-3 text-sm text-text-primary placeholder:text-text-tertiary/40 outline-none font-bold min-w-0"
          value={emailToken}
          onChange={(e) => setEmailToken(e.target.value)}
        />
        <button 
          type="submit" 
          className="bg-accent hover:bg-white hover:text-accent text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shrink-0"
        >
          Join Waitlist
        </button>
      </div>
    </form>
  );
}
