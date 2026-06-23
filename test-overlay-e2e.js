const puppeteer = require('puppeteer');

(async () => {
  console.log("=== Gumroad Native Overlay E2E Test ===\n");
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Capture page logs
  page.on('console', msg => console.log(`   [PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.log(`   [PAGE ERROR] ${err.toString()}`));
  
  // Track navigations
  let navigatedToGumroad = false;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame() && frame.url().includes('gumroad.com')) {
      navigatedToGumroad = true;
      console.log(`  ❌ [NAV] Main frame redirected to: ${frame.url()}`);
    }
  });
  
  // Step 1: Navigate to pricing page
  console.log("1. Navigating to pricing page...");
  await page.goto('https://aletheia-live.vercel.app/pricing', { 
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  console.log(`   ✅ Loaded: ${page.url()}`);
  
  // Step 2: Wait for Gumroad script to fully initialize
  console.log("\n2. Waiting for Gumroad script to initialize...");
  await new Promise(r => setTimeout(r, 5000)); // Give it plenty of time
  
  // Check for gumroad elements
  const scriptCheck = await page.evaluate(() => {
    const gumroadScripts = document.querySelectorAll('script[src*="gumroad"]');
    const gumroadLinks = document.querySelectorAll('link[href*="gumroad"]');
    
    // Check for shadow DOM container (what gumroad-bundle.js creates)
    let hasShadowRoot = false;
    const bodyDivs = document.querySelectorAll('body > div');
    for (const div of bodyDivs) {
      if (div.shadowRoot) {
        hasShadowRoot = true;
        break;
      }
    }
    
    // Check for gumroad logo spans appended to buttons
    const logoSpans = document.querySelectorAll('.gumroad-button .logo-full');
    
    return {
      scripts: gumroadScripts.length,
      cssLinks: gumroadLinks.length,
      shadowDomReady: hasShadowRoot,
      buttonsProcessed: logoSpans.length, // Gumroad appends <span class="logo-full"> to processed links
    };
  });
  
  console.log(`   Scripts found: ${scriptCheck.scripts}`);
  console.log(`   CSS links found: ${scriptCheck.cssLinks}`);
  console.log(`   Shadow DOM ready: ${scriptCheck.shadowDomReady}`);
  console.log(`   Buttons processed by gumroad: ${scriptCheck.buttonsProcessed}`);
  
  // Step 3: Find and click a gumroad button
  console.log("\n3. Looking for gumroad buttons...");
  const gumroadButtons = await page.$$('a.gumroad-button');
  console.log(`   Found ${gumroadButtons.length} gumroad buttons`);
  
  if (gumroadButtons.length === 0) {
    console.log("   ❌ No gumroad buttons found!");
    await page.screenshot({ path: 'test_no_buttons.png' });
    await browser.close();
    process.exit(1);
  }
  
  // Click first button
  console.log("   Clicking first button...");
  await page.screenshot({ path: 'test_before_click.png' });
  
  await gumroadButtons[0].click();
  
  // Wait for overlay
  console.log("   Waiting 6 seconds for overlay...");
  await new Promise(r => setTimeout(r, 6000));
  
  if (navigatedToGumroad) {
    console.log("\n=== ❌ FAIL: Main frame redirected to Gumroad ===");
    await browser.close();
    process.exit(1);
  }
  
  console.log(`   ✅ Still on: ${page.url()}`);
  
  // Step 4: Check for overlay
  console.log("\n4. Checking for overlay content...");
  
  // Check all frames (the overlay creates an iframe)
  const frames = page.frames();
  console.log(`   Total frames: ${frames.length}`);
  
  let gumroadFrame = null;
  for (const frame of frames) {
    const url = frame.url();
    if (url.includes('gumroad.com')) {
      console.log(`   ✅ Gumroad iframe found: ${url}`);
      gumroadFrame = frame;
    }
  }
  
  await page.screenshot({ path: 'test_after_click.png' });
  console.log("   Screenshot saved: test_after_click.png");
  
  // Verdict
  console.log("\n=== VERDICT ===");
  if (gumroadFrame) {
    console.log("✅ SUCCESS: Gumroad overlay is working! Checkout loaded in iframe without redirect.");
  } else {
    console.log("❌ FAIL: No Gumroad overlay iframe detected.");
    console.log("   The gumroad.js script may not have initialized properly.");
  }
  
  await browser.close();
  process.exit(gumroadFrame ? 0 : 1);
})();
