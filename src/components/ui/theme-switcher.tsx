"use client";
import { Palette, Check } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../context/theme-context";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({
  align = "bottom",
  side = "left",
  iconOnly = false,
  className
}: {
  align?: "top" | "bottom";
  side?: "left" | "right";
  iconOnly?: boolean;
  className?: string;
}) {
  const { currentTheme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-xl text-text-secondary hover:bg-accent/10 hover:text-accent transition-all duration-300 border border-transparent hover:border-accent/20",
          iconOnly ? "p-2.5" : "px-4 py-2.5",
          className
        )}
        title="Change theme"
      >
        <Palette className="w-5 h-5 text-accent" />
        {!iconOnly && <span className="text-sm font-black hidden sm:inline uppercase tracking-widest">{currentTheme.name}</span>}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Theme Dropdown */}
          <div className={cn(
            "absolute w-72 bg-surface/95 backdrop-blur-3xl border border-border/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in",
            align === "top" ? "bottom-full mb-3" : "top-full mt-3",
            side === "left" ? "left-0" : "right-0"
          )}>
            <div className="p-4 border-b border-border/5 bg-foreground/[0.02]">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-1">Select Theme</h3>
              <p className="text-[11px] text-text-tertiary uppercase tracking-tight font-bold">Choose your workspace aesthetic</p>
            </div>

            <div className="p-2 max-h-96 overflow-y-auto">
              {themes.map((theme) => {
                const isActive = theme.id === currentTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-surface-elevated"
                        : "hover:bg-surface-elevated"
                    )}
                  >
                    {/* Color Preview */}
                    <div className="flex gap-1 mt-1 p-1 bg-black/20 rounded border border-white/5">
                      <div
                        className="w-3.5 h-3.5 rounded-sm shadow-sm transform group-hover:scale-110 transition-transform duration-200 border border-white/10"
                        style={{ backgroundColor: theme.colors.background }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-sm shadow-sm transform group-hover:scale-110 transition-transform duration-200 border border-white/10"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-sm shadow-sm transform group-hover:scale-110 transition-transform duration-200 border border-white/10"
                        style={{ backgroundColor: theme.colors.success }}
                      />
                    </div>

                    {/* Theme Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[12px] font-black uppercase tracking-wide",
                          isActive ? "text-accent" : "text-text-primary/70"
                        )}>
                          {theme.name}
                        </span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                        )}
                      </div>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-tight font-bold leading-tight">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
