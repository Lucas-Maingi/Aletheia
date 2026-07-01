import { prisma } from '@/lib/prisma';
import { InvestigationList } from '@/components/dashboard/investigation-list';
import { Shield, Search, Database, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEffectiveUserId } from '@/lib/auth-utils';

export default async function InvestigationsIndexPage() {
    const user = await getEffectiveUserId();

    const investigations = await prisma.investigation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            subjectUsername: true,
            tags: true,
            notes: true,
            isShared: true,
        }
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Back to Dashboard Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
                <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
                <span className="opacity-50">/</span>
                <span className="text-white">Investigations</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <a href="/dashboard">
                        <Button variant="ghost" size="icon" className="h-8 w-8 border border-white/5 bg-background/50 hover:bg-white/10 rounded-full shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </a>
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent ring-1 ring-accent/20">
                        <Database className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Investigation Index</h1>
                        <p className="text-text-tertiary">Access and manage your complete intelligence database.</p>
                    </div>
                </div>
            </div>

            <Card className="bg-surface/30 border-white/5">
                <CardContent className="p-6">
                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input
                            className="w-full bg-background border-white/5 focus:border-accent focus:ring-1 focus:ring-accent rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
                            placeholder="Search by title, username, or email..."
                        />
                    </div>

                    <InvestigationList investigations={investigations as any} />
                </CardContent>
            </Card>
        </div>
    );
}
