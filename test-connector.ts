import { usernameSearch } from './src/connectors/usernameSearch';

async function test() {
    const target = "lucas"; // Common username to ensure results
    console.log(`[TEST] Searching for: ${target}`);
    try {
        const result = await usernameSearch(target);
        console.log(`[TEST] Result Count: ${result.results.length}`);
        result.results.forEach((r, i) => {
            console.log(`${i+1}. ${r.title} (${r.url})`);
        });
    } catch (err) {
        console.error(`[TEST] Error:`, err);
    }
}

test();
