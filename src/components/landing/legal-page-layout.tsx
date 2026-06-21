"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LandingHeader } from "./landing-header";
import { Footer } from "../footer";
import { ContentBackButton } from "./content-back-button";


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LegalSection {
  id: string;
  title: string;
  legalText: React.ReactNode;
  summary: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPageLayout({ title, lastUpdated, sections }: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Back to top button visibility
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // Spy scroll to update active section in sidebar
      const sectionElements = sections.map(s => document.getElementById(s.id));
      let currentActiveId = sections[0]?.id || "";
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          // if top is above middle of viewport, it's active
          if (rect.top <= window.innerHeight / 2) {
            currentActiveId = el.id;
            break;
          }
        }
      }
      setActiveSection(currentActiveId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans relative pb-24">
      <LandingHeader />
      
      {/* Background ambient glows */}
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 pt-24 md:pt-32 relative z-10">
        <ContentBackButton />
        {/* Page Header */}
        <div className="mb-16 md:mb-24 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            {title}
          </h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
            Last Updated: <span className="text-purple-400">{lastUpdated}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-32 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-4 px-3">
                Contents
              </h3>
              <nav className="flex flex-col gap-1 border-l border-slate-800/60 ml-3">
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "text-left py-2 px-4 text-sm transition-all duration-300 relative border-l-2 -ml-[1px]",
                        isActive 
                          ? "text-purple-400 border-purple-500 font-medium bg-purple-500/5 shadow-[inset_1px_0_0_#a855f7]" 
                          : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30"
                      )}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 max-w-4xl space-y-24">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32 group">
                <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-8 pb-4 border-b border-slate-800/60 flex items-center gap-4">
                  <span className="text-purple-500/50 text-xl font-mono opacity-50 group-hover:opacity-100 transition-opacity">§</span>
                  {section.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                  
                  {/* Legal Text */}
                  <div className="md:col-span-7">
                    <div className="font-['Inter'] text-[14px] leading-relaxed text-slate-300 space-y-4 pl-4 border-l border-slate-800/60 relative">
                      <div className="absolute top-0 bottom-0 left-[-1px] w-[1px] bg-gradient-to-b from-purple-500/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      {section.legalText}
                    </div>
                  </div>

                  {/* Human Readable Summary */}
                  <div className="md:col-span-5">
                    <div className="sticky top-32">
                      <div className="relative rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-purple-500/20 p-6 overflow-hidden group-hover:border-purple-500/40 transition-colors duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        {/* Summary Amethyst Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/80 to-transparent opacity-50" />
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-600/20 rounded-full blur-[20px] pointer-events-none" />
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                          <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold">
                            Human Readable
                          </h4>
                        </div>
                        <div className="font-sans text-sm text-purple-100/80 leading-relaxed space-y-3">
                          {section.summary}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            ))}
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-xl bg-slate-900/80 backdrop-blur-lg border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] group"
            style={{ perspective: "1000px" }}
          >
            {/* 3D styling internals */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div
              whileHover={{ rotateX: 20, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ChevronUp className="w-5 h-5 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="mt-24 border-t border-border/10">
        <Footer />
      </div>
    </div>
  );
}
