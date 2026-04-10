// Native fetch available in Node.js 18+

async function debugSiphon() {
    // A standard public image of Donald Trump
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg';
    const encodedImage = encodeURIComponent(imageUrl);
    const url = `https://yandex.com/images/search?rpt=imageview&url=${encodedImage}`;

    console.log(`--- ALETHEIA JSON-SIPHON DEBUGGER ---`);
    console.log(`Searching Yandex: ${url}`);
    
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html',
                'Referer': 'https://yandex.com/images/'
            }
        });
        const html = await res.text();
        
        // Use the new JSON extraction logic
        const bemRegex = /data-bem='(\{[\s\S]*?serp-item[\s\S]*?\})'/g;
        let match;
        let count = 0;
        
        while ((match = bemRegex.exec(html)) !== null && count < 10) {
            try {
                const rawJson = match[1].replace(/&quot;/g, '"');
                const data = JSON.parse(rawJson);
                const item = data['serp-item'];
                
                if (item && item.img_href) {
                    console.log(`[Result ${count+1}]`);
                    console.log(`  Title: ${item.snippet?.title || 'No Title'}`);
                    console.log(`  URL: ${item.img_href}`);
                    console.log(`  Snippet: ${item.snippet?.text?.substring(0, 100)}...`);
                    count++;
                }
            } catch (e) {}
        }
        
        console.log(`\nTOTAL EXTRACTED RESULTS: ${count}`);

    } catch (e) {
        console.error(`[FAIL]:`, e.message);
    }
}

debugSiphon();
