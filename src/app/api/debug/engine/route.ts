import { NextResponse } from 'next/server';
import { usernameSearch } from '@/connectors/usernameSearch';
import { domainSearch } from '@/connectors/domainSearch';
import { googleDorks } from '@/connectors/googleDorks';
import { interpolSearch } from '@/connectors/interpolSearch';
import { cryptoSearch } from '@/connectors/cryptoSearch';
import { darkWebSearch } from '@/connectors/darkWebSearch';
import { peopleSearch } from '@/connectors/peopleSearch';

export async function GET(request: Request) {
    console.log("=== ALETHEIA OSINT ENGINE DIAGNOSTIC v2 ===");
    
    const { searchParams } = new URL(request.url);
    const targetTest = searchParams.get('test');

    const allTests = [
        { id: 'username', name: 'Username', func: usernameSearch, target: 'bitget' },
        { id: 'domain', name: 'Domain', func: domainSearch, target: 'aletheia.software' },
        { id: 'interpol', name: 'Interpol', func: interpolSearch, target: 'Smith' },
        { id: 'crypto', name: 'Crypto', func: cryptoSearch, target: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
        { id: 'darkweb', name: 'Dark Web', func: darkWebSearch, target: 'aletheia' },
        { id: 'people', name: 'People Search', func: peopleSearch, target: 'Mark Mbithi' },
        { id: 'dorks', name: 'Google Dorks', func: googleDorks, target: 'site:github.com "aletheia"' }
    ];

    const testsToRun = targetTest ? allTests.filter(t => t.id === targetTest) : allTests;

    const results = await Promise.all(
        testsToRun.map(async (test) => {
            const start = Date.now();
            try {
                // Add an explicit absolute timeout to the entire connector call to prevent infinite hangs
                const res = await Promise.race([
                    (test.func as any)(test.target),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("CONNECTOR TIMEOUT (30s)")), 30000))
                ]);
                const duration = Date.now() - start;
                const count = res.results ? res.results.length : 0;
                return { id: test.id, name: test.name, status: count > 0 ? 'GREEN' : 'YELLOW', count, duration };
            } catch (err: any) {
                return { id: test.id, name: test.name, status: 'RED', error: err.message, duration: Date.now() - start };
            }
        })
    );

    return NextResponse.json({
        summary: "OSINT Engine Health Report",
        timestamp: new Date().toISOString(),
        tested: testsToRun.map(t => t.id).join(', '),
        results
    });
}

