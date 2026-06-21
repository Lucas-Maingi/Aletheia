"use client";

import { 
    Settings, 
    LogOut, 
    Shield,
    ChevronDown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface UserNavProps {
    user: {
        id: string;
        email?: string;
        isGuest?: boolean;
    };
}

export function UserNav({ user }: UserNavProps) {
    const initials = user.email?.substring(0, 2).toUpperCase() || "AN";
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-accent/20 transition-all group outline-none">
                    <Avatar className="h-9 w-9 border border-border/10 shadow-sm transition-transform group-hover:scale-105">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-accent/10 text-[11px] font-black text-accent uppercase">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 bg-surface/95 backdrop-blur-2xl border-border/10 shadow-2xl rounded-2xl" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal px-3 py-4">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border/10 shadow-sm">
                                <AvatarFallback className="bg-accent/10 text-xs font-black text-accent">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <p className="text-xs font-black text-text-primary truncate">
                                    {user.isGuest ? "Guest Session" : (user.email || "Unknown User")}
                                </p>
                                <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest flex items-center gap-1.5">
                                    <Shield className="w-2.5 h-2.5 text-accent" />
                                    {user.isGuest ? "Temporary Clearance" : "Vector Analyst"}
                                </p>
                            </div>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/5" />
                <DropdownMenuGroup className="p-1">
                    <Link href="/dashboard/settings">
                        <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-text-secondary focus:text-accent focus:bg-accent/5 cursor-pointer gap-3 transition-colors">
                            <Settings className="w-4 h-4" />
                            Account Settings
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/5" />
                <div className="p-1">
                    {!user.isGuest ? (
                        <form action="/auth/logout" method="POST">
                            <DropdownMenuItem 
                                asChild
                                className="rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-danger hover:text-white hover:bg-danger/80 focus:text-white focus:bg-danger/80 cursor-pointer gap-3 transition-all"
                            >
                                <button className="w-full text-left flex items-center">
                                    <LogOut className="w-4 h-4" />
                                    Terminate Session
                                </button>
                            </DropdownMenuItem>
                        </form>
                    ) : (
                        <Link href="/auth/login">
                            <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-accent hover:text-white hover:bg-accent focus:text-white focus:bg-accent cursor-pointer gap-3 transition-all">
                                <LogOut className="w-4 h-4 rotate-180" />
                                Elevate Clearance
                            </DropdownMenuItem>
                        </Link>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
