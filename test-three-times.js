const puppeteer = require('puppeteer');

async function runSingleTest(testNumber, buttonIndex, buttonDescription) {
  console.log(`\n--- RUNNING TEST ${testNumber}: Clicking ${buttonDescription} ---`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  let navigatedToGumroad = false;
  let pageErrors = [];
  let consoleLogs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('violates the following Content Security Policy')) {
      consoleLogs.push(`[CSP ERROR] ${text}`);
    }
  });
  
  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });
  
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame() && frame.url().includes('gumroad.com') && !frame.url().includes('overlay=true')) {
      navigatedToGumroad = true;
      console.log(`  ❌ [NAV] Main frame redirected to: ${frame.url()}`);
    }
  });
  
  try {
    console.log(`  Navigating to pricing page...`);
    await page.goto('https://aletheia-live.vercel.app/pricing', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log(`  Waiting for page hydration...`);
    await new Promise(r => setTimeout(r, 5000));
    
    const gumroadButtons = await page.$$('.pricing-pay-button');
    console.log(`  Found ${gumroadButtons.length} gumroad buttons on page.`);
    
    if (gumroadButtons.length <= buttonIndex) {
      throw new Error(`Could not find button index ${buttonIndex}. Total buttons: ${gumroadButtons.length}`);
    }
    
    console.log(`  Clicking button at index ${buttonIndex}...`);
    await gumroadButtons[buttonIndex].click();
    
    console.log(`  Waiting for overlay to load...`);
    await new Promise(r => setTimeout(r, 6000));
    
    // Check frames
    const frames = page.frames();
    let gumroadFrameUrl = null;
    for (const frame of frames) {
      const url = frame.url();
      if (url.includes('gumroad.com')) {
        gumroadFrameUrl = url;
        break;
      }
    }
    
    const screenshotPath = `test_run_${testNumber}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`  Screenshot saved as: ${screenshotPath}`);
    
    let success = false;
    if (navigatedToGumroad) {
      console.log(`  ❌ FAIL: Redirected to Gumroad external page.`);
    } else if (gumroadFrameUrl) {
      console.log(`  ✅ SUCCESS: Overlay iframe loaded successfully: ${gumroadFrameUrl.split('?')[0]}`);
      success = true;
    } else {
      console.log(`  ❌ FAIL: No Gumroad iframe detected and no redirect occurred.`);
    }
    
    if (pageErrors.length > 0) {
      console.log(`  ⚠️ Browser page errors detected during this run:`);
      pageErrors.forEach(err => console.log(`     - ${err}`));
    }
    
    if (consoleLogs.length > 0) {
      console.log(`  ⚠️ CSP errors detected:`);
      consoleLogs.forEach(log => console.log(`     - ${log}`));
    }
    
    await browser.close();
    return { success, navigatedToGumroad, hasIframe: !!gumroadFrameUrl, screenshotPath };
    
  } catch (err) {
    console.log(`  ❌ Error during test run: ${err.message}`);
    await browser.close();
    return { success: false, error: err.message };
  }
}

(async () => {
  console.log("=== STARTING 3x MULTI-BUTTON E2E VERIFICATION ON LIVE SITE ===\n");
  
  // Test 1: First card (Pro - Index 0)
  const result1 = await runSingleTest(1, 0, "Analyst Pro (Main Card)");
  
  // Test 2: Second card (Command Center - Index 1)
  const result2 = await runSingleTest(2, 1, "Command Center (Main Card)");
  
  // Test 3: Comparison table button (Agency Arsenal - Index 5)
  const result3 = await runSingleTest(3, 5, "Agency Arsenal (Comparison Table)");
  
  console.log("\n=== MULTI-RUN E2E TEST SUMMARY ===");
  console.log(`Test 1 (Pro Card): ${result1.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Test 2 (Command Card): ${result2.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Test 3 (Agency Table): ${result3.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = result1.success && result2.success && result3.success;
  process.exit(allPassed ? 0 : 1);
})();
