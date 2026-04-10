"use client";

import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";
import { Shield, ExternalLink, User, CheckCircle2, AlertTriangle, XCircle, Zap, Search, Globe, MapPin, Info, ChevronDown } from "lucide-react";
import { FacialMatch } from "@/connectors/visualIntel";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useInvestigation } from "@/context/InvestigationContext";

interface VitalityAudit {
  verdict: "Real" | "Synthetic" | "Suspicious";
  confidence: number;
  markers: string[];
}

interface Props {
  matches: FacialMatch[];
  isScanning: boolean;
  audit?: VitalityAudit | null;
  exifData?: any[];
  subjectImageUrl?: string | null;
}

// Platforms that orbit the central hub during a scan — real SVG paths for logos
const ORBIT_PLATFORMS = [
  { label: "Instagram", color: "#E4405F", angle: 0,
    svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "X / Twitter", color: "#ffffff", angle: 22.5,
    svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "Facebook", color: "#1877F2", angle: 45,
    svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "LinkedIn", color: "#0A66C2", angle: 67.5,
    svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { label: "TikTok", color: "#FF0050", angle: 90,
    svg: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  { label: "Reddit", color: "#FF4500", angle: 112.5,
    svg: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" },
  { label: "YouTube", color: "#FF0000", angle: 135,
    svg: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "GitHub", color: "#8B5CF6", angle: 157.5,
    svg: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
  { label: "Snapchat", color: "#FFFC00", angle: 180,
    svg: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" },
  { label: "Pinterest", color: "#E60023", angle: 202.5,
    svg: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" },
  { label: "WhatsApp", color: "#25D366", angle: 225,
    svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
  { label: "Telegram", color: "#26A5E4", angle: 247.5,
    svg: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
  { label: "VK", color: "#0077FF", angle: 270,
    svg: "M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.058-2.763-5.35-2.763-5.834 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.744-.576.744z" },
  { label: "Discord", color: "#5865F2", angle: 292.5,
    svg: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1569 2.4189z" },
  { label: "Twitch", color: "#9146FF", angle: 315,
    svg: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" },
  { label: "Google", color: "#4285F4", angle: 337.5,
    svg: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.8 4.133-1.12 1.12-2.853 2.333-6.04 2.333-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053z" },
];

/** Rotating scanline ring that sweeps across the face */
function ScanRing({ active }: { active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
      initial={false}
    >
      {/* Outer pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
        animate={active ? { scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] } : { opacity: 0.15 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Rotating sweep gradient */}
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 270deg, rgba(0,240,255,0.3) 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      )}
      {/* Inner glow */}
      <motion.div
        className="absolute inset-2 rounded-full border border-cyan-400/20"
        animate={active ? { opacity: [0.2, 0.6, 0.2] } : { opacity: 0.1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </motion.div>
  );
}

/** Biometric mesh: dots + lines overlaid on the face */
function BiometricMesh({ active }: { active: boolean }) {
  if (!active) return null;
  // Key biometric landmark positions (relative %)
  const landmarks = [
    { x: 50, y: 28 }, // forehead
    { x: 35, y: 42 }, // left eye
    { x: 65, y: 42 }, // right eye
    { x: 50, y: 52 }, // nose
    { x: 38, y: 62 }, // left mouth corner
    { x: 62, y: 62 }, // right mouth corner
    { x: 50, y: 70 }, // chin top
    { x: 50, y: 82 }, // chin
    { x: 25, y: 50 }, // left cheek
    { x: 75, y: 50 }, // right cheek
  ];
  const lines = [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5],
    [4, 6], [5, 6], [6, 7], [1, 8], [2, 9],
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection lines */}
        {lines.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={landmarks[a].x} y1={landmarks[a].y}
            x2={landmarks[b].x} y2={landmarks[b].y}
            stroke="rgba(0,240,255,0.35)"
            strokeWidth="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0.2] }}
            transition={{ duration: 1.5, delay: i * 0.07, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
        {/* Landmark dots */}
        {landmarks.map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.x} cy={pt.y} r="1.2"
            fill="rgba(0,240,255,0.8)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.5] }}
            transition={{ duration: 0.6, delay: i * 0.08, repeat: Infinity, repeatDelay: 2.5 }}
          />
        ))}
      </svg>
    </div>
  );
}

/** Single orbiting platform icon — real SVG logo */
function OrbitIcon({ label, color, svg, angle, active }: {
  label: string; color: string; svg: string; angle: number; active: boolean;
}) {
  const RADIUS = 120; // px from centre — wider for 16 icons
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * RADIUS;
  const y = Math.sin(rad) * RADIUS;

  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
      animate={active ? {
        x: [0, x * 0.2, x],
        y: [0, y * 0.2, y],
        opacity: [0, 0.4, 1],
        scale: [0.5, 0.8, 1],
      } : { x: 0, y: 0, opacity: 0, scale: 0 }}
      transition={{ duration: 0.6, delay: angle / 800, ease: "backOut" }}
    >
      <motion.div
        className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-lg backdrop-blur-sm"
        style={{
          backgroundColor: `${color}18`,
          borderColor: `${color}40`,
          boxShadow: active ? `0 0 12px ${color}44` : "none",
        }}
        animate={active ? { boxShadow: [`0 0 6px ${color}22`, `0 0 18px ${color}55`, `0 0 6px ${color}22`] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        title={label}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={color}>
          <path d={svg} />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/** Central biometric hub — the main focal point */
function BiometricHub({ imageUrl, isScanning, matchCount }: {
  imageUrl?: string | null;
  isScanning: boolean;
  matchCount: number;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 select-none">
      {/* Orbit container */}
      <div className="relative w-[340px] h-[340px] flex items-center justify-center">
        {/* Orbiting platform icons */}
        {ORBIT_PLATFORMS.map(p => (
          <OrbitIcon key={p.label} {...p} active={isScanning} />
        ))}

        {/* Outer decorative rings */}
        <motion.div
          className="absolute rounded-full border border-white/5"
          style={{ width: 240, height: 240 }}
          animate={isScanning ? { rotate: 360 } : {}}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full border border-cyan-400/10"
          style={{ width: 200, height: 200 }}
          animate={isScanning ? { rotate: -360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Central face circle */}
        <div className="relative w-36 h-36 rounded-full z-10">
          <ScanRing active={isScanning} />

          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 bg-slate-900 relative">
            {imageUrl ? (
              <img src={imageUrl} alt="Subject" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-white/10" />
              </div>
            )}
            <BiometricMesh active={isScanning} />
          </div>

          {/* Match count badge */}
          {matchCount > 0 && !isScanning && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-cyan-400/40 whitespace-nowrap"
            >
              {matchCount} MATCH{matchCount !== 1 ? "ES" : ""}
            </motion.div>
          )}
        </div>
      </div>

      {/* Status label */}
      <div className="text-center space-y-1">
        {isScanning ? (
          <motion.p
            className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-cyan-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ◉ BIOMETRIC SWEEP ACTIVE
          </motion.p>
        ) : matchCount > 0 ? (
          <p className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-emerald-400">
            ◉ SWEEP COMPLETE — {matchCount} LEADS ISOLATED
          </p>
        ) : (
          <p className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-white/30">
            ○ AWAITING TARGET DATA
          </p>
        )}
        <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
          {isScanning ? "Cross-referencing 16 intelligence engines..." : "Aletheia Visual Intelligence v3"}
        </p>
      </div>
    </div>
  );
}

/** Sherlock-style result card */
function MatchCard({ match, index }: { match: FacialMatch; index: number }) {
  const pct = match.confidence > 0 ? Math.round(match.confidence * 100) : (match.score || 85);
  const isHigh = pct >= 90;
  const isMed = pct >= 70 && pct < 90;

  const color = isHigh ? "#00f0ff" : isMed ? "#f59e0b" : "#6b7280";
  const glow = isHigh ? "shadow-cyan-400/20" : isMed ? "shadow-amber-400/20" : "";

  const host = (() => {
    try { return new URL(match.url).hostname.replace('www.', ''); } catch { return match.platform; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, ease: "backOut", duration: 0.5 }}
      className={`group relative rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${glow} ${
        match.isVerified ? 'border-cyan-400/25 bg-cyan-950/20' : 'border-white/8 bg-white/[0.02]'
      }`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          {/* Platform / Thumbnail */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/10 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
              {match.thumbnailBase64 ? (
                <img src={match.thumbnailBase64} className="w-full h-full object-cover" alt="" />
              ) : (
                <Globe className="w-4 h-4 text-white/20" />
              )}
            </div>
            <div>
              <div className="text-[11px] font-black text-white/80 truncate max-w-[120px]">{match.platform}</div>
              <div className="text-[9px] font-mono text-white/30 truncate max-w-[120px]">{host}</div>
            </div>
          </div>

          {/* Match percentage */}
          <div className="text-right">
            <div className="font-black font-mono text-3xl leading-none" style={{ color }}>
              {pct}<span className="text-sm ml-0.5">%</span>
            </div>
            <div className="text-[8px] uppercase tracking-widest font-black mt-0.5" style={{ color: `${color}99` }}>
              MATCH
            </div>
          </div>
        </div>

        {/* Entity name if identified */}
        {(match.extractedIdentity || match.metadata?.identifiedEntity || match.metadata?.entity) && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">
              {match.extractedIdentity || match.metadata?.identifiedEntity || match.metadata?.entity}
            </span>
          </div>
        )}

        {/* Match bar */}
        <div className="mb-4">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: index * 0.07 + 0.3, ease: "easeOut" }}
              style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-mono text-white/20 uppercase">Signal strength</span>
            <span className="text-[8px] font-mono uppercase" style={{ color: `${color}99` }}>
              {isHigh ? "EXTREME" : isMed ? "ELEVATED" : "MODERATE"}
            </span>
          </div>
        </div>

        {/* Source description snippet */}
        {match.metadata?.description && (
          <p className="text-[10px] text-white/40 font-mono leading-relaxed line-clamp-2 mb-4">
            {match.metadata.description}
          </p>
        )}

        {/* CTA */}
        <a
          href={match.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group/btn"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover/btn:text-white/70 transition-colors font-mono">
            Inspect Source
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover/btn:text-white/70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
        </a>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function FacialAnalysis({ matches, isScanning, audit, exifData = [], subjectImageUrl }: Props) {
  const [showMarkers, setShowMarkers] = useState(false);
  const { forceVisualScrape } = useInvestigation();

  const hasData = matches.length > 0 || exifData.length > 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* ── BIOMETRIC HUB ── */}
      <div className="relative rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-2xl overflow-hidden p-6">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(0,240,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        <div className="relative z-10">
          <BiometricHub imageUrl={subjectImageUrl} isScanning={isScanning} matchCount={matches.length} />

          {/* Force scrape button */}
          {!isScanning && (
            <div className="flex justify-center mt-2">
              <button
                onClick={forceVisualScrape}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/40 hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/30 transition-all group"
              >
                <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
                Force Deep Scrape
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── VITALITY AUDIT ── */}
      <AnimatePresence>
        {audit && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
          >
            <div className={`h-0.5 w-full bg-gradient-to-r ${
              audit.verdict === 'Real' ? 'from-emerald-500 to-green-400' :
              audit.verdict === 'Synthetic' ? 'from-red-500 to-rose-400' : 'from-amber-500 to-orange-400'
            }`} />
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  audit.verdict === 'Real' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  audit.verdict === 'Synthetic' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {audit.verdict === 'Real' ? <CheckCircle2 className="w-6 h-6" /> :
                   audit.verdict === 'Synthetic' ? <XCircle className="w-6 h-6" /> :
                   <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-black uppercase tracking-widest text-white/80">Identity Vitality</span>
                    <Badge className={`text-[8px] font-black uppercase px-2 py-0 rounded-md ${
                      audit.verdict === 'Real' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      audit.verdict === 'Synthetic' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>{audit.verdict}</Badge>
                  </div>
                  <p className="text-[10px] text-white/30 font-mono">
                    Stability yield: {(audit.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              {audit.markers.length > 0 && (
                <button
                  onClick={() => setShowMarkers(!showMarkers)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/8 text-[9px] font-mono font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-all"
                >
                  Markers <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMarkers ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showMarkers && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 grid grid-cols-2 md:grid-cols-3 gap-2 border-t border-white/5 pt-4"
                >
                  {audit.markers.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 shadow-[0_0_6px_#00f0ff]" />
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-tight">{m}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULT CARDS ── */}
      {matches.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-white/20">
              {matches.length} Intelligence Lead{matches.length !== 1 ? 's' : ''} Isolated
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {matches.map((m, i) => <MatchCard key={i} match={m} index={i} />)}
          </div>
        </div>
      )}

      {/* ── EXIF / METADATA ── */}
      {exifData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white/40">
              Forensic Metadata
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exifData.map((exif, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 backdrop-blur-xl"
              >
                <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {exif.title}
                </div>
                <div className="prose prose-invert prose-xs max-w-none text-white/50 font-mono text-[10px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{exif.description}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!isScanning && !hasData && (
        <div className="text-center py-8 space-y-2">
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
            No visual intelligence recovered. Run a sweep to begin.
          </p>
        </div>
      )}

      {/* ── PROTOCOL FOOTER ── */}
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
        <div className="p-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 shrink-0">
          <Info className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-[10px] text-white/25 leading-relaxed font-mono">
          <span className="text-cyan-400/70 font-black uppercase tracking-[0.2em] block mb-1">Analyst Protocol</span>
          Visual intelligence is derived from cross-referencing public archival data and biometric index APIs.
          All confidence scores are probabilistic. Cross-verify with technical signatures for definitive attribution.
        </div>
      </div>
    </div>
  );
}
