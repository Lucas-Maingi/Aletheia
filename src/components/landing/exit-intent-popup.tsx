'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaitlistForm } from '@/components/landing/waitlist-form';
import { ShieldAlert, X } from 'lucide-react';

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    let scrollPos = window.scrollY;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse leaves top of screen
      if (e.clientY <= 0 && !hasTriggered) {
        triggerPopup();
      }
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollSpeed = scrollPos - currentScroll;
      
      // Fast scroll up on mobile devices (speed > 50) near top
      if (scrollSpeed > 50 && currentScroll < 200 && !hasTriggered && window.innerWidth < 768) {
        triggerPopup();
      }
      scrollPos = currentScroll;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !hasTriggered) {
        triggerPopup();
      }
    };

    const triggerPopup = () => {
      setIsVisible(true);
      setHasTriggered(true);
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasTriggered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-surface border border-accent/20 rounded-2xl shadow-2xl overflow-hidden relative"
          >
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary z-10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <ShieldAlert className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-text-primary mb-3">
                Wait, Don't Miss Out
              </h2>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed font-mono">
                Aletheia is currently available as a Lifetime Deal for early adopters. If you're not ready to commit, join the waitlist to be notified when public subscriptions launch.
              </p>
              
              <WaitlistForm />
              
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-[10px] text-text-tertiary hover:text-text-secondary uppercase tracking-widest font-mono underline decoration-text-tertiary/30 underline-offset-4 transition-colors"
                >
                  No thanks, I'll pass for now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
