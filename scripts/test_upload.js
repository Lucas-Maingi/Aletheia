// Manual test for the Data URL upload bridge - LOGGING DATA
async function testDataUrlSiphon() {
    const sampleDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc7W1dLF4UXl5f0oeXk93eXnRefH99vf5+fr6/P29/dn5+feH94hIWGh4iJiipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/w8QHxIWGh4iJiipKTlJWWl5iZmqKi4pKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD/AD/';
    
    console.log('--- DATA-URL BRIDGE DEBUG ---');
    const match = sampleDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return;
    
    const buffer = Buffer.from(match[2], 'base64');
    const formData = new FormData();
    const blob = new Blob([buffer], { type: match[1] });
    formData.append('upfile', blob, 'subject.jpg');

    const uploadUrl = 'https://yandex.com/images/search?rpt=imageview&format=json&request=%7B%22blocks%22%3A%5B%7B%22block%22%3A%22b-page_type_search-by-image__link%22%7D%5D%7D';
    
    try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        console.log('Keys:', Object.keys(data));
        console.log('Response:', JSON.stringify(data).substring(0, 500));
        
        // Find the URL anywhere in the response
        const str = JSON.stringify(data);
        const urlMatch = str.match(/https?:\/\/[^"]+avatars\.mds\.yandex\.net[^"]+/);
        if (urlMatch) {
            console.log('FOUND URL:', urlMatch[0]);
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}
testDataUrlSiphon();
