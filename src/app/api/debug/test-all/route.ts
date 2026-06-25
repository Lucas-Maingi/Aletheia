import { NextResponse } from 'next/server';
import { 
    usernameSearch, 
    googleDorks, 
    domainSearch, 
    breachSearch, 
    reverseImageSearch, 
    darkWebSearch, 
    interpolSearch, 
    cryptoSearch,
    peopleSearch,
    ipinfo,
    whatsMyName,
    securityTrails,
    ecosystemSearch,
    registrationScout,
    siphonHub,
    vehicleSearch
} from '@/connectors';
import { extractExif } from '@/connectors/exifMetadata';

export const maxDuration = 60; // 60s max execution

export async function GET() {
    console.log("=== RUNNING OSINT CONNECTORS END-TO-END SUITE ===");

    const TEST_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';

    const testCases = [
        { id: 'usernameSearch', name: 'Username Search', func: usernameSearch, query: 'bitget' },
        { id: 'whatsMyName', name: 'WhatsMyName', func: whatsMyName, query: 'lucas' },
        { id: 'ecosystemSearch', name: 'Ecosystem Discovery', func: ecosystemSearch, query: 'google' },
        { id: 'domainSearch', name: 'Domain Search', func: domainSearch, query: 'aletheia.software' },
        { id: 'securityTrails', name: 'SecurityTrails', func: securityTrails, query: 'github.com' },
        { id: 'ipinfo', name: 'IPinfo Geolocation', func: ipinfo, query: '8.8.8.8' },
        { id: 'breachSearch', name: 'Breach Search', func: breachSearch, query: 'test@example.com' },
        { id: 'registrationScout', name: 'Registration Scout', func: registrationScout, query: 'contact@aletheia.software' },
        { id: 'cryptoSearch', name: 'Crypto Registry', func: cryptoSearch, query: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
        { id: 'darkWebSearch', name: 'Dark Web Search', func: darkWebSearch, query: 'aletheia' },
        { id: 'peopleSearch', name: 'People Search', func: peopleSearch, query: 'Mark Mbithi' },
        { id: 'interpolSearch', name: 'Interpol Search', func: () => interpolSearch({ name: 'Smith' }), query: 'Smith' },
        { id: 'googleDorks', name: 'Google Dorks', func: () => googleDorks({ name: 'Mark', email: 'mark@example.com' }), query: 'Mark / mark@example.com' },
        { id: 'vehicleSearch', name: 'Vehicle Registry', func: vehicleSearch, query: 'CA12345' },
        { id: 'reverseImageSearch', name: 'Visual Intel (FaceCheck)', func: () => reverseImageSearch(TEST_IMAGE), query: TEST_IMAGE },
        { id: 'siphonHub', name: 'Visual Siphon Hub', func: () => siphonHub(TEST_IMAGE), query: TEST_IMAGE },
        { id: 'exifMetadata', name: 'EXIF Extraction', func: () => extractExif(TEST_IMAGE), query: TEST_IMAGE }
    ];

    const results = [];

    for (const test of testCases) {
        const start = Date.now();
        console.log(`[TEST-SUITE] Executing connector: ${test.name}...`);
        try {
            // Apply 8s timeout to prevent hanging the test suite
            const res = await Promise.race([
                test.func(test.query as any),
                new Promise<any>((_, reject) => setTimeout(() => reject(new Error("CONNECTOR_TIMEOUT")), 8000))
            ]);

            const duration = Date.now() - start;
            const items = res?.results || [];
            
            results.push({
                id: test.id,
                name: test.name,
                status: items.length > 0 ? 'ACTIVE' : 'EMPTY',
                query: test.query,
                count: items.length,
                durationMs: duration,
                sample: items.length > 0 ? {
                    title: items[0].title,
                    url: items[0].url,
                    category: items[0].category,
                    snippet: items[0].description?.slice(0, 200) + (items[0].description?.length > 200 ? '...' : '')
                } : null
            });
        } catch (err: any) {
            results.push({
                id: test.id,
                name: test.name,
                status: 'FAILED',
                query: test.query,
                count: 0,
                durationMs: Date.now() - start,
                error: err.message || String(err)
            });
        }
    }

    return NextResponse.json({
        suite: "Aletheia Connectors End-to-End Suite",
        timestamp: new Date().toISOString(),
        totalRun: testCases.length,
        active: results.filter(r => r.status === 'ACTIVE').length,
        empty: results.filter(r => r.status === 'EMPTY').length,
        failed: results.filter(r => r.status === 'FAILED').length,
        results
    });
}
