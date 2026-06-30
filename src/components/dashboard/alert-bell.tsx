"use client";

import { useState, useEffect } from "react";
import { Bell, ShieldAlert, Circle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface AlertBellProps {
  className?: string;
  iconSize?: number;
}

export function AlertBell({ className, iconSize = 20 }: AlertBellProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/notifications'); // Reusing existing notification system
      const data = await res.json();
      setAlerts(data.slice(0, 5));
      setUnreadCount(data.filter((a: Alert) => !a.isRead).length);
    } catch (err) {
      console.error("Alert fetch failed:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`relative ${className || "p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group active:scale-95"}`}>
          <Bell className={`transition-colors ${unreadCount > 0 ? 'text-accent animate-pulse' : 'text-text-tertiary group-hover:text-text-primary'}`} style={{ width: iconSize, height: iconSize }} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[8px] font-bold text-white shadow-lg ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-surface border-border/10 text-white shadow-2xl p-0 overflow-hidden">
        <div className="bg-foreground/5 p-4 border-b border-border/10 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Intelligence Alerts</span>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  markAllAsRead();
                }} 
                className="text-[9px] font-bold uppercase tracking-wider text-accent hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
            {unreadCount > 0 && (
              <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent text-[8px]">{unreadCount} New</Badge>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto no-scrollbar">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-text-muted opacity-30 italic text-[10px]">
                No active reconnaissance hits.
            </div>
          ) : (
            alerts.map((alert) => (
              <DropdownMenuItem 
                key={alert.id} 
                onClick={() => !alert.isRead && markAsRead(alert.id)}
                className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer flex flex-col items-start gap-1 focus:bg-white/10 ${!alert.isRead ? 'bg-white/[0.02]' : 'opacity-60'}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-1.5 h-1.5 rounded-full ${!alert.isRead ? (alert.type === 'danger' ? 'bg-danger shadow-[0_0_5px_#ef4444]' : 'bg-warning') : 'bg-slate-600'}`} />
                  <span className="text-[11px] font-bold text-white truncate flex-1">{alert.title}</span>
                  <span className="text-[9px] text-slate-500 font-mono italic">{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans">{alert.message}</p>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="bg-white/5 m-0" />
        <Link href="/dashboard/watchlists" className="block p-3 text-center text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5 transition-colors">
            View Surveillance Grid
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
