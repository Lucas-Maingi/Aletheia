// Diagnostic: Test each engine directly from Node.js environment
// Run: node scripts/test-siphon.js

async function fetchImageBuffer(url) {
    if (url.startsWith('data:')) {
        const match = url.match(/^data:([^;]+);base64,(.+)$/);
        return { buffer: Buffer.from(match[2], 'base64'), mimeType: match[1] };
    }
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const buf = Buffer.from(await res.arrayBuffer());
    return { buffer: buf, mimeType: res.headers.get('content-type') || 'image/jpeg' };
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Use a public Trump image URL for testing
const TEST_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/White_shark.jpg/400px-White_shark.jpg';

async function testYandex() {
    console.log('\n=== YANDEX ENGINE TEST ===');
    try {
        const { buffer, mimeType } = await fetchImageBuffer(TEST_IMAGE_URL);
        console.log(`Image fetched: ${buffer.length} bytes, type: ${mimeType}`);

        const arrayBuf = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const fd = new FormData();
        fd.append('upfile', new Blob([arrayBuf], { type: mimeType }), 'target.jpg');

        console.log('Posting to Yandex...');
        const uploadRes = await fetch('https://yandex.com/images/search?rpt=imageview', {
            method: 'POST',
            headers: {
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://yandex.com',
                'Referer': 'https://yandex.com/images/',
            },
            body: fd,
            redirect: 'manual',
        });

        console.log(`Upload response status: ${uploadRes.status}`);
        console.log(`Location header: ${uploadRes.headers.get('location')}`);
        console.log(`Content-Type: ${uploadRes.headers.get('content-type')}`);

        if (uploadRes.status === 200) {
            const body = await uploadRes.text();
            console.log(`Body length: ${body.length}`);
            console.log(`Body preview (500 chars): ${body.slice(0, 500)}`);
            const cbirMatch = body.match(/cbir_id=([a-zA-Z0-9_%-]+)/);
            console.log(`cbir_id found: ${cbirMatch ? cbirMatch[1] : 'NONE'}`);
            
            // Check if CAPTCHA
            if (body.includes('captcha') || body.includes('CheckaptchaForm')) {
                console.log('⚠️  CAPTCHA DETECTED — Yandex is blocking this IP');
            }
        }
    } catch (e) {
        console.error('Yandex test FAILED:', e.message);
    }
}

async function testTinEye() {
    console.log('\n=== TINEYE ENGINE TEST ===');
    try {
        const { buffer, mimeType } = await fetchImageBuffer(TEST_IMAGE_URL);
        
        const arrayBuf = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        const fd = new FormData();
        fd.append('image', new Blob([arrayBuf], { type: mimeType }), 'target.jpg');

        console.log('Posting to TinEye...');
        const res = await fetch('https://tineye.com/search', {
            method: 'POST',
            headers: {
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml',
                'Origin': 'https://tineye.com',
                'Referer': 'https://tineye.com/',
            },
            body: fd,
        });

        console.log(`TinEye response status: ${res.status}`);
        console.log(`Final URL: ${res.url}`);
        const html = await res.text();
        console.log(`HTML length: ${html.length}`);
        
        const countMatch = html.match(/(\d[\d,]*)\s+(?:results?|matches?)\s+found/i);
        console.log(`Match count: ${countMatch ? countMatch[1] : 'not found in HTML'}`);
        
        if (html.includes('captcha') || html.includes('blocked')) {
            console.log('⚠️  BLOCKED — TinEye is rate-limiting or blocking this IP');
        }
        
        // Check __NEXT_DATA__ presence
        const hasNextData = html.includes('__NEXT_DATA__');
        console.log(`Has __NEXT_DATA__: ${hasNextData}`);
        
        console.log(`HTML preview (300 chars): ${html.slice(0, 300)}`);
    } catch (e) {
        console.error('TinEye test FAILED:', e.message);
    }
}

async function testYandexUrl() {
    console.log('\n=== YANDEX URL-BASED TEST (public URL) ===');
    try {
        const encoded = encodeURIComponent(TEST_IMAGE_URL);
        const url = `https://yandex.com/images/search?rpt=imageview&url=${encoded}`;
        console.log(`Fetching: ${url}`);
        const res = await fetch(url, {
            headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Referer': 'https://yandex.com/images/' }
        });
        console.log(`Status: ${res.status}`);
        const html = await res.text();
        console.log(`HTML length: ${html.length}`);
        
        const bemCount = (html.match(/data-bem='.*?serp-item/g) || []).length;
        console.log(`data-bem serp-item blocks found: ${bemCount}`);
        
        const cbirMatch = html.match(/"CbirSites":\{"sites":\[/);
        console.log(`CbirSites section found: ${!!cbirMatch}`);
        
        if (html.includes('captcha') || html.includes('CheckaptchaForm')) {
            console.log('⚠️  CAPTCHA DETECTED');
        }
    } catch (e) {
        console.error('Yandex URL test FAILED:', e.message);
    }
}

(async () => {
    await testYandex();
    await testTinEye();
    await testYandexUrl();
    console.log('\n=== DIAGNOSTIC COMPLETE ===');
})();
