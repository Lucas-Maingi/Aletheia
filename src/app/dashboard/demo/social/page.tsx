"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Search, Globe, Mail, User, Clock, Terminal, Database,
  MapPin, Hash, Play, RotateCcw, AlertTriangle, CheckCircle2,
  Sparkles, Video, HelpCircle, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_PERSON, CONNECTOR_DISPLAY_NAMES } from "@/lib/demo-data";

type EvidenceItem = typeof DEMO_PERSON.evidence[number];
type EntityItem = typeof DEMO_PERSON.entities[number];
type TimelineEntry = typeof DEMO_PERSON.timeline[number];

export default function SocialMediaDemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.2); // Speed multiplier
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle/Prompt, 1: Typing, 2: Dispatching, 3: Scanning, 4: AI Synthesis, 5: Complete
  const [typedTarget, setTypedTarget] = useState("");
  const [activeConnectors, setActiveConnectors] = useState<string[]>([]);
  const [finishedConnectors, setFinishedConnectors] = useState<string[]>([]);
  const [visibleEvidence, setVisibleEvidence] = useState<EvidenceItem[]>([]);
  const [visibleEntities, setVisibleEntities] = useState<EntityItem[]>([]);
  const [visibleLogs, setVisibleLogs] = useState<TimelineEntry[]>([]);
  const [showDossier, setShowDossier] = useState(false);
  const [dossierText, setDossierText] = useState("");
  const [hideControls, setHideControls] = useState(false);

  const targetEmail = "john.doe@example.com";
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play control loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 1000 / speed;

    timerRef.current = setInterval(() => {
      // Step definitions:
      // 0: Start typing target
      // 1-15: Progressively add logs, connectors, evidence, and entities
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next === 1) {
          // Start typing
          animateTyping(targetEmail);
          return next;
        }
        
        if (next >= 2 && next <= 12) {
          // Add timeline events, evidence, and entities matching the simulation timeline
          const logIndex = next - 2;
          if (DEMO_PERSON.timeline[logIndex]) {
            setVisibleLogs((logs) => [...logs, DEMO_PERSON.timeline[logIndex]]);
          }

          // Simulate connectors finishing
          if (logIndex === 1) {
            // Dispatched connectors
            setActiveConnectors(Object.keys(CONNECTOR_DISPLAY_NAMES));
          } else if (logIndex >= 2 && logIndex <= 10) {
            const connectorKeys = Object.keys(CONNECTOR_DISPLAY_NAMES);
            const finishedKey = connectorKeys[logIndex - 2];
            if (finishedKey) {
              setActiveConnectors((active) => active.filter((k) => k !== finishedKey));
              setFinishedConnectors((fin) => [...fin, finishedKey]);
            }

            // Reveal corresponding evidence and entities
            const evidenceSlice = DEMO_PERSON.evidence.slice(0, logIndex - 1);
            setVisibleEvidence(evidenceSlice);

            const entitiesSlice = DEMO_PERSON.entities.slice(0, logIndex - 1);
            setVisibleEntities(entitiesSlice);
          }
          return next;
        }

        if (next === 13) {
          // Start AI synthesis
          setVisibleLogs((logs) => [...logs, DEMO_PERSON.timeline[11]]); // AI synthesis initiated
          return next;
        }

        if (next === 14) {
          // Type out dossier
          setShowDossier(true);
          animateDossier();
          setVisibleLogs((logs) => [...logs, DEMO_PERSON.timeline[12]]); // Intelligence dossier generated
          return next;
        }

        if (next > 14) {
          // Complete
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return 15; // capped
        }

        return next;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const animateTyping = (text: string) => {
    let index = 0;
    const typingTimer = setInterval(() => {
      setTypedTarget((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(typingTimer);
      }
    }, 50 / speed);
  };

  const animateDossier = () => {
    let index = 0;
    const fullText = DEMO_PERSON.dossier;
    const chunk = 15; // Characters per interval
    const dossierTimer = setInterval(() => {
      setDossierText((prev) => prev + fullText.substring(index, index + chunk));
      index += chunk;
      if (index >= fullText.length) {
        clearInterval(dossierTimer);
      }
    }, 30 / speed);
  };

  const startSimulation = () => {
    resetSimulation();
    setIsPlaying(true);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setTypedTarget("");
    setActiveConnectors([]);
    setFinishedConnectors([]);
    setVisibleEvidence([]);
    setVisibleEntities([]);
    setVisibleLogs([]);
    setShowDossier(false);
    setDossierText("");
  };

  const skipToEnd = () => {
    setIsPlaying(false);
    setCurrentStep(15);
    setTypedTarget(targetEmail);
    setActiveConnectors([]);
    setFinishedConnectors(Object.keys(CONNECTOR_DISPLAY_NAMES));
    setVisibleEvidence(DEMO_PERSON.evidence);
    setVisibleEntities(DEMO_PERSON.entities);
    setVisibleLogs(DEMO_PERSON.timeline);
    setShowDossier(true);
    setDossierText(DEMO_PERSON.dossier);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col relative">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* Floating Cinematic Control Panel (Can be hidden for screen recording) */}
      <AnimatePresence>
        {!hideControls && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-zinc-900/90 border border-zinc-800 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-6"
          >
            <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
              <Video className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Record Studio</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 rounded-full p-0 hover:bg-zinc-800 text-white"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <span className="text-xs font-bold text-yellow-400">PAUSE</span>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={resetSimulation}
                className="h-8 w-8 rounded-full p-0 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={skipToEnd}
                className="h-8 px-3 rounded-full hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white"
              >
                Skip to End
              </Button>
            </div>

            <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Speed:</span>
              <div className="flex gap-1">
                {[0.5, 1, 1.5, 2.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                      speed === s ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setHideControls(true)}
              className="text-zinc-500 hover:text-zinc-300 pl-2 border-l border-zinc-800"
              title="Hide controls (Double click anywhere to show again)"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper trigger to restore controls if hidden */}
      {hideControls && (
        <div 
          className="fixed top-0 left-0 right-0 h-4 z-50 cursor-pointer hover:bg-purple-900/10 transition-colors flex items-center justify-center"
          onClick={() => setHideControls(false)}
          title="Click to show recording controls"
        >
          <div className="w-16 h-1 rounded-full bg-zinc-800" />
        </div>
      )}

      {/* Main Studio Viewport */}
      <div 
        className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full pt-20"
        onDoubleClick={() => setHideControls(false)}
      >
        {/* Stage 1: Terminal Input Prompt */}
        {currentStep === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-3 text-[10px] font-mono text-zinc-500 tracking-wider">ALETHEIA INTEL DIRECTORY SWEEP</span>
                </div>
                <Shield className="w-4 h-4 text-purple-500" />
              </div>

              <div className="space-y-4">
                <div className="text-sm font-semibold text-zinc-400">Initiate footprint sweep for investigation target:</div>
                <div className="flex items-center gap-3 p-3 bg-black border border-zinc-900 rounded-lg">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span className="font-mono text-emerald-400">john.doe@example.com</span>
                  <span className="w-1.5 h-4 bg-zinc-500 animate-pulse" />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={startSimulation}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Auto-Play Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stage 2: Active Investigation Board */}
        {currentStep > 0 && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Scan Status & Console Logs */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Scan Status Panel */}
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 shadow-xl backdrop-blur-md">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Investigation Engine</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-md font-bold truncate text-white">{DEMO_PERSON.investigation.title}</h2>
                    <span className="text-[10px] text-zinc-400">Subject: John Michael Doe</span>
                  </div>
                  {currentStep >= 14 ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 px-2.5 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      COMPLETE
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1.5 px-2.5 py-1 animate-pulse">
                      <Loader className="w-3 h-3 animate-spin" />
                      SCANNING
                    </Badge>
                  )}
                </div>

                {/* Simulated Connector Matrix */}
                <div className="border-t border-zinc-900 pt-4">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Connectors Running ({visibleEntities.length}/12)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(CONNECTOR_DISPLAY_NAMES).map(([key, value]) => {
                      const isActive = activeConnectors.includes(key);
                      const isFinished = finishedConnectors.includes(key);

                      return (
                        <div
                          key={key}
                          className={`p-2 rounded border text-center transition-all duration-300 ${
                            isFinished
                              ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400"
                              : isActive
                              ? "bg-purple-500/5 border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.1)]"
                              : "bg-zinc-900/20 border-zinc-950 text-zinc-600"
                          }`}
                        >
                          <div className="text-xs mb-1">{value.icon}</div>
                          <div className="text-[9px] truncate font-mono">{value.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Console Logs */}
              <div className="flex-1 bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Live Log Feed</h3>
                <div className="flex-1 font-mono text-[10px] space-y-2.5 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
                  <AnimatePresence initial={false}>
                    {visibleLogs.map((log, index) => {
                      let typeColor = "text-zinc-500";
                      if (log.type === "social" || log.type === "professional") typeColor = "text-purple-400";
                      if (log.type === "breach") typeColor = "text-red-400";
                      if (log.type === "infrastructure" || log.type === "geolocation") typeColor = "text-blue-400";
                      if (log.type === "ai") typeColor = "text-yellow-400 font-bold";
                      if (log.type === "complete") typeColor = "text-emerald-400 font-bold";

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-zinc-600">[{log.time}]</span>
                          <span className={`${typeColor}`}>{log.event}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* CENTER & RIGHT COLUMN: Entities, Evidence, & Dossier */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Discovered Entities Board */}
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 shadow-xl backdrop-blur-md">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Discovered Targets & Pivots</h3>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {visibleEntities.map((entity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                      >
                        {entity.type === "email" && <Mail className="w-3 h-3 text-purple-400" />}
                        {entity.type === "username" && <User className="w-3 h-3 text-purple-400" />}
                        {entity.type === "domain" && <Globe className="w-3 h-3 text-blue-400" />}
                        {entity.type === "ip" && <Hash className="w-3 h-3 text-blue-400" />}
                        {entity.type === "location" && <MapPin className="w-3 h-3 text-emerald-400" />}
                        {entity.type === "name" && <User className="w-3 h-3 text-zinc-400" />}
                        
                        <span>{entity.value}</span>
                        <span className="text-[8px] text-zinc-500 bg-black px-1 rounded-sm">{entity.confidence}%</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Live Intelligence Feed or Dossier */}
              <div className="flex-1 min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                  {!showDossier ? (
                    // Evidence Card Grid
                    <motion.div
                      key="evidence"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {visibleEvidence.map((ev) => (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-zinc-950/70 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/30 border border-purple-900/30 px-2 py-0.5 rounded-full">
                                {ev.platform}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                ev.confidenceLabel === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400" :
                                ev.confidenceLabel === "HIGH" ? "bg-blue-500/10 text-blue-400" : "bg-zinc-800 text-zinc-400"
                              }`}>
                                {ev.confidenceLabel}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mb-1.5">{ev.title}</h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed truncate-3-lines">{ev.content}</p>
                          </div>
                          <div className="text-[8px] text-zinc-600 font-mono mt-3 text-right">
                            {ev.timestamp.split("T")[1].replace("Z", "")}
                          </div>
                        </motion.div>
                      ))}
                      {visibleEvidence.length === 0 && (
                        <div className="col-span-2 flex-1 flex flex-col items-center justify-center text-zinc-600">
                          <Database className="w-10 h-10 mb-2 animate-bounce" />
                          <span className="text-xs font-mono">Awaiting connector ingestion...</span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    // Dossier Display
                    <motion.div
                      key="dossier"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 bg-zinc-950/80 border border-zinc-900 rounded-xl p-6 shadow-2xl backdrop-blur-md flex flex-col font-mono text-xs text-zinc-300 leading-relaxed overflow-y-auto max-h-[500px]"
                    >
                      <div className="flex items-center gap-2 text-yellow-400 mb-4 border-b border-zinc-900 pb-3">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-bold uppercase tracking-wider">AI Executive Dossier Synthesis</span>
                      </div>
                      
                      <div className="whitespace-pre-wrap flex-1 scrollbar-thin">
                        {dossierText}
                      </div>

                      {currentStep >= 15 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="mt-6 p-4 border border-purple-500/30 rounded-xl bg-purple-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                        >
                          <div>
                            <div className="text-xs font-bold text-white mb-1">Founding Member LTDs Available</div>
                            <p className="text-[10px] text-zinc-400">Deploy Aletheia on your own target domains and investigators.</p>
                          </div>
                          <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] h-8 rounded-lg">
                            Claim Lifetime Deal →
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple loader helper
function Loader(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
