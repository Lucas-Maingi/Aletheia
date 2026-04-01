// Inspect the actual Yandex HTML structure to find the right JSON extraction pattern
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const testUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/White_shark.jpg/400px-White_shark.jpg';
const encoded = encodeURIComponent(testUrl);

const res = await fetch(`https://yandex.com/images/search?rpt=imageview&url=${encoded}`, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Referer': 'https://yandex.com/images/' }
});

const html = await res.text();
console.log(`HTML size: ${html.length} bytes`);

// Try all known Yandex state-injection patterns
const patterns = [
    ['__INITIAL_STATE__',    /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]{0,2000})/],
    ['serverState',          /window\.__serverState\s*=\s*(\{[\s\S]{0,2000})/],
    ['Ya.Data',              /Ya\.Data\.define\([^,]+,\s*(\{[\s\S]{0,2000})/],
    ['initial-data script',  /<script[^>]+id="initial-data"[^>]*>([\s\S]{0,2000})<\/script>/],
    ['cbir JSON',            /"cbir"\s*:\s*(\{[\s\S]{0,1000})/],
    ['sites array',          /"sites"\s*:\s*(\[[\s\S]{0,1000})/],
    ['CbirSites',            /"CbirSites"[\s\S]{0,1000}/],
    ['serp-list JSON',       /"serp-list"\s*:\s*(\{[\s\S]{0,500})/],
    ['entities',             /"entities"\s*:\s*(\[[\s\S]{0,500})/],
    ['name known entity',    /"knowingName"\s*:\s*"([^"]{1,100})"/],
    ['image results',        /"image"\s*:\s*\{[^}]{0,200}"url":\s*"(https?:[^"]{10,200})"/],
    ['pageUrl',              /"pageUrl"\s*:\s*"(https?:[^"]{10,200})"/g],
    ['hostUrl',              /"hostUrl"\s*:\s*"(https?:[^"]{10,200})"/g],
];

let foundAny = false;
for (const [name, pattern] of patterns) {
    const m = html.match(pattern);
    if (m) {
        console.log(`\n✅ FOUND [${name}]:`);
        console.log(m[0].slice(0, 300));
        foundAny = true;
    }
}

if (!foundAny) {
    console.log('\n❌ No known patterns found. Raw HTML sample:');
    // Print sections that might contain results
    const idx = html.indexOf('"url"');
    console.log('First "url" occurrence context:', html.slice(Math.max(0, idx - 100), idx + 300));
    
    // Check head
    console.log('\nHead section:', html.slice(0, 500));
    
    // Check if it's a different page (login wall, etc.)
    if (html.includes('captcha')) console.log('⚠️  CAPTCHA present');
    if (html.includes('login') || html.includes('sign in')) console.log('⚠️  Login wall');
    if (html.includes('Sorry') || html.includes('blocked')) console.log('⚠️  Blocked page');
    
    // Look for any JSON-like structures
    const jsonMatches = html.match(/\{[^{}]{200,500}\}/g) || [];
    console.log(`\nLarge JSON-like blocks found: ${jsonMatches.length}`);
    if (jsonMatches.length > 0) {
        console.log('First block sample:', jsonMatches[0].slice(0, 200));
    }
}

// Also count key structural markers
console.log(`\n--- STRUCTURAL MARKERS ---`);
console.log(`"url" occurrences: ${(html.match(/"url"/g) || []).length}`);
console.log(`"title" occurrences: ${(html.match(/"title"/g) || []).length}`);
console.log(`<script> tags: ${(html.match(/<script/g) || []).length}`);
console.log(`data-bem attrs: ${(html.match(/data-bem=/g) || []).length}`);
console.log(`data-state attrs: ${(html.match(/data-state=/g) || []).length}`);
console.log(`data-component attrs: ${(html.match(/data-component=/g) || []).length}`);
