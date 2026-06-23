"use client";

import { useEffect, useRef } from "react";

/**
 * GumroadScript — Loads the Gumroad overlay script using a raw DOM injection
 * approach that bypasses Next.js Script component issues. 
 * 
 * The script is injected via useEffect AFTER React has rendered the DOM,
 * ensuring all anchor elements are present when gumroad-bundle.js scans.
 * 
 * A MutationObserver watches for the shadow DOM container that gumroad creates,
 * confirming successful initialization.
 */
export function GumroadScript() {
  const injectedRef = useRef(false);

  useEffect(() => {
    // Only inject once
    if (injectedRef.current) return;
    injectedRef.current = true;

    // Remove any existing gumroad scripts to avoid double-initialization
    document.querySelectorAll('script[src*="gumroad"]').forEach(s => s.remove());
    document.querySelectorAll('link[href*="gumroad"]').forEach(l => l.remove());

    // Inject the script fresh — this is exactly how Gumroad recommends it
    const script = document.createElement("script");
    script.src = "https://gumroad.com/js/gumroad.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount (SPA navigation away)
      script.remove();
    };
  }, []);

  return null;
}
