"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
 *
 * To avoid iframe input click offsets, it is rendered directly inside
 * document.body using a React Portal.
 */

interface GumroadOverlayProps {
  productUrl: string | null; // e.g. "https://lucas808.gumroad.com/l/ukfec"
  onClose: () => void;
}

export function GumroadOverlay({ productUrl, onClose }: GumroadOverlayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

      // Check if event.data is a string (often serialized JSON)
      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // ignore
        }
      }

      if (data && typeof data === "object") {
        if (data.type === "loaded" || data.post_message_name === "loaded") {
          setIsLoading(false);
        }
        if (data.post_message_name === "sale" || data.type === "sale") {
          console.log("[Gumroad Custom Overlay] Sale successful!");
          window.location.href = "/success";
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

  // Build the overlay URL exactly as gumroad-bundle.js does
  let overlayUrl: URL | null = null;
  if (productUrl) {
    try {
      overlayUrl = new URL(productUrl);
      overlayUrl.searchParams.set("wanted", "true"); // Skip product description landing page, show checkout form directly
      overlayUrl.searchParams.set("overlay", "true");
      overlayUrl.searchParams.set("referrer", typeof window !== "undefined" ? window.location.origin : "");
    } catch (e) {
      console.error("Invalid product URL passed to GumroadOverlay:", productUrl, e);
    }
  }

  const overlayContent = (
    <AnimatePresence>
      {productUrl && overlayUrl && (
        <>
          {/* Animated Backdrop (Only has transforms, sits behind overlay) */}
          <motion.div
            key="gumroad-overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999998]"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
            onClick={onClose}
          />

          {/* Plain, transform-free, non-animated container for the iframe checkout to resolve input click alignment issues */}
          <div
            className="fixed inset-0 z-[999999] flex items-start justify-center overflow-y-auto pointer-events-none"
            onClick={(e) => {
              // Close when clicking the outer wrapper spacing (not inside the iframe container)
              if (e.target === e.currentTarget) onClose();
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="fixed top-4 right-4 z-[1000000] w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm pointer-events-auto"
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

            {/* Gumroad checkout iframe container */}
            <div className="w-full max-w-2xl mx-auto p-4 lg:px-8 lg:py-16 pointer-events-auto">
              <iframe
                src={overlayUrl.toString()}
                className="w-full rounded-lg border-none bg-white shadow-2xl"
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
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(overlayContent, document.body);
}
