import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getEffectiveUserId();

    try {
        const { id } = await params;

        const investigation = await prisma.investigation.findFirst({
            where: { id, userId: user.id },
            include: {
                reports: { orderBy: { createdAt: 'desc' }, take: 1 },
                evidence: { orderBy: { createdAt: 'desc' } },
                entities: { orderBy: { createdAt: 'desc' } },
            }
        });

        if (!investigation) {
            return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
        }

        const report = investigation.reports[0];
        const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const target = investigation.subjectEmail || investigation.subjectUsername || investigation.subjectName || investigation.title;

        const evidenceHtml = investigation.evidence.map((ev: any, idx: number) => {
            const confidence = Math.round((ev.confidenceScore || 0) * 100);
            const confColor = confidence >= 90 ? '#22c55e' : confidence >= 70 ? '#eab308' : '#94a3b8';
            const platform = ev.tags?.split(',')?.[0]?.toUpperCase() || 'EVIDENCE';
            const content = (ev.content || '').replace(/\*\*/g, '').replace(/#{1,3} [^\n]+\n/g, '').slice(0, 500);
            const sourceUrl = ev.sourceUrl || '';
            return `
            <div style="page-break-inside:avoid;border:1px solid #1e293b;border-radius:10px;padding:16px;margin-bottom:14px;background:#0f172a;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div style="font-size:9px;font-weight:900;letter-spacing:0.15em;color:#00f0ff;text-transform:uppercase;">${idx + 1}. ${platform}</div>
                    <div style="font-size:9px;font-weight:700;color:${confColor};background:${confColor}20;border:1px solid ${confColor}40;padding:2px 8px;border-radius:4px;">${confidence}% MATCH</div>
                </div>
                <div style="font-size:12px;font-weight:800;color:#f1f5f9;margin-bottom:8px;line-height:1.4;">${ev.title || 'Intelligence Node'}</div>
                <div style="font-size:10px;color:#94a3b8;line-height:1.6;white-space:pre-wrap;font-family:monospace;">${content}</div>
                ${sourceUrl ? `<div style="margin-top:8px;font-size:9px;color:#00f0ff;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">→ <a href="${sourceUrl}" style="color:#00f0ff;">${sourceUrl.slice(0, 80)}${sourceUrl.length > 80 ? '...' : ''}</a></div>` : ''}
            </div>`;
        }).join('');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <title>Aletheia Dossier — ${target}</title>
    <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        @page{margin:18mm 14mm;size:A4;}
        body{font-family:'Segoe UI',sans-serif;background:#020617;color:#e2e8f0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        a{color:#00f0ff;}
    </style>
</head>
<body>
    <!-- Cover -->
    <div style="background:#020617;padding:36px 40px;border-bottom:2px solid #00f0ff;margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
            <div>
                <div style="font-size:8px;font-weight:900;letter-spacing:0.4em;color:#00f0ff;text-transform:uppercase;margin-bottom:6px;">ALETHEIA INTELLIGENCE SYSTEMS</div>
                <div style="font-size:26px;font-weight:900;color:#f1f5f9;text-transform:uppercase;letter-spacing:-0.02em;font-style:italic;">Intelligence Dossier</div>
                <div style="font-size:13px;color:#64748b;margin-top:4px;font-weight:600;">${investigation.title}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:8px;color:#475569;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:3px;">GENERATED</div>
                <div style="font-size:11px;color:#94a3b8;font-weight:600;">${now}</div>
                <div style="font-size:8px;color:#334155;margin-top:6px;letter-spacing:0.1em;text-transform:uppercase;">Classification: CONFIDENTIAL</div>
            </div>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
            ${investigation.subjectEmail ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;"><div style="font-size:7px;color:#475569;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:2px;">EMAIL</div><div style="font-size:12px;color:#22c55e;font-weight:700;font-family:monospace;">${investigation.subjectEmail}</div></div>` : ''}
            ${investigation.subjectUsername ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;"><div style="font-size:7px;color:#475569;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:2px;">HANDLE</div><div style="font-size:12px;color:#00f0ff;font-weight:700;font-family:monospace;">@${investigation.subjectUsername}</div></div>` : ''}
            ${investigation.subjectName ? `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;"><div style="font-size:7px;color:#475569;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:2px;">SUBJECT</div><div style="font-size:12px;color:#f1f5f9;font-weight:700;">${investigation.subjectName}</div></div>` : ''}
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;"><div style="font-size:7px;color:#475569;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:2px;">EVIDENCE NODES</div><div style="font-size:12px;color:#a78bfa;font-weight:700;">${investigation.evidence?.length || 0} artifacts</div></div>
        </div>
    </div>

    <div style="padding:0 40px 40px;">
        ${report ? `
        <div style="margin-bottom:36px;">
            <div style="font-size:8px;font-weight:900;letter-spacing:0.3em;color:#00f0ff;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #1e293b;">AI Intelligence Summary</div>
            <div style="background:#0f172a;border:1px solid #1e293b;border-left:3px solid #00f0ff;border-radius:8px;padding:18px;font-size:11px;color:#94a3b8;line-height:1.8;white-space:pre-wrap;">${report.content?.slice(0, 2500)}</div>
        </div>` : ''}

        <div>
            <div style="font-size:8px;font-weight:900;letter-spacing:0.3em;color:#00f0ff;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #1e293b;">Evidence Archive — ${investigation.evidence?.length || 0} Intelligence Nodes</div>
            ${evidenceHtml || '<div style="text-align:center;padding:40px;color:#475569;font-size:12px;">No evidence artifacts captured.</div>'}
        </div>

        <div style="margin-top:40px;padding-top:16px;border-top:1px solid #1e293b;display:flex;justify-content:space-between;">
            <div style="font-size:7px;color:#334155;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Aletheia Intelligence Systems © 2026</div>
            <div style="font-size:7px;color:#334155;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">FOR AUTHORIZED USE ONLY</div>
        </div>
    </div>

    <script>window.onload = () => setTimeout(() => window.print(), 400);</script>
</body>
</html>`;

        const filename = `Aletheia_Dossier_${(investigation.title || 'report').replace(/\s+/g, '_')}.pdf`;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Export failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
