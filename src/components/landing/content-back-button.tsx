"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function ContentBackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-accent transition-colors mb-6 focus:outline-none"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
        </button>
    );
}
