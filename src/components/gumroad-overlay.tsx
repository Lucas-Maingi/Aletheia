"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

/**
 * GumroadOverlay — A self-contained overlay component that replicates
 * what gumroad-bundle.js does internally: loads the product page in an
 * iframe with ?overlay=true, which tells Gumroad to serve the embeddable
 * checkout version designed for iframe embedding.
 *
 * This bypasses all issues with gumroad.js failing to initialize in
 * Next.js / React SPA environments.
 */

interface GumroadOverlayProps {
  productUrl: string | null; // e.g. "https://lucas808.gumroad.com/l/ukfec"
  onClose: () => void;
}

export function GumroadOverlay({ productUrl, onClose }: GumroadOverlayProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Listen for postMessage from the Gumroad iframe (same as gumroad-bundle.js does)
  useEffect(() => {
    if (!productUrl) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const url = new URL(event.origin);
        if (!url.host.endsWith("gumroad.com")) return;
      } catch {
        return;
      }

      // Gumroad sends { type: "loaded" } when the checkout is ready
      if (event.data && typeof event.data === "object") {
        if (event.data.type === "loaded") {
          setIsLoading(false);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [productUrl]);

  // Also set a fallback timeout to hide the loader
  useEffect(() => {
    if (!productUrl) return;
    const timer = setTimeout(() => setIsLoading(false), 4000);
    return () => clearTimeout(timer);
  }, [productUrl]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (productUrl) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [productUrl]);

  if (!productUrl) return null;

  // Build the overlay URL exactly as gumroad-bundle.js does
  const overlayUrl = new URL(productUrl);
  overlayUrl.searchParams.set("overlay", "true");
  overlayUrl.searchParams.set("referrer", window.location.href);

  return (
    <AnimatePresence>
      <motion.div
        key="gumroad-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[999999] flex items-start justify-center overflow-y-auto"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        onClick={(e) => {
          // Close when clicking backdrop (not iframe content)
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[1000000] w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Loading spinner */}
        {isLoading && (
          <div className="fixed inset-0 z-[1000001] flex items-center justify-center pointer-events-none">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* Gumroad checkout iframe */}
        <div className="w-full max-w-2xl mx-auto p-4 lg:px-8 lg:py-16">
          <iframe
            src={overlayUrl.toString()}
            className="w-full rounded-lg border-none bg-white"
            style={{
              minHeight: "600px",
              height: "80vh",
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
            allow="payment"
            title="Gumroad Checkout"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
