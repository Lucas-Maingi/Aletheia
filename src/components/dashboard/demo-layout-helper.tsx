"use client";

import { usePathname } from "next/navigation";

export function DemoLayoutHelper() {
    const pathname = usePathname();
    if (pathname === '/dashboard/demo') {
        return (
            <style dangerouslySetInnerHTML={{ __html: `
                main {
                    padding-top: 0 !important;
                }
                aside {
                    padding-top: 0 !important;
                }
            `}} />
        );
    }
    return null;
}
