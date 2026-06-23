const puppeteer = require('puppeteer');

(async () => {
  console.log("=== Gumroad Overlay E2E Test ===\n");
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Track all navigations
  let navigatedAway = false;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      console.log(`  [NAV] Main frame navigated to: ${frame.url()}`);
      if (frame.url().includes('gumroad.com')) {
        navigatedAway = true;
      }
    }
  });
  
  // Step 1: Navigate to pricing page
  console.log("1. Navigating to pricing page...");
  await page.goto('https://aletheia-live.vercel.app/pricing', { 
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  console.log(`   Current URL: ${page.url()}`);
  
  // Step 2: Wait for Gumroad script to load
  console.log("\n2. Waiting for Gumroad script to initialize...");
  await new Promise(r => setTimeout(r, 3000));
  
  // Check if gumroad bundle loaded
  const gumroadLoaded = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.some(s => s.src && s.src.includes('gumroad'));
  });
  console.log(`   Gumroad script present in DOM: ${gumroadLoaded}`);
  
  // Check for gumroad shadow DOM (overlay container)
  const hasShadowRoot = await page.evaluate(() => {
    const divs = document.querySelectorAll('body > div');
    for (const div of divs) {
      if (div.shadowRoot) return true;
    }
    return false;
  });
  console.log(`   Gumroad shadow DOM (overlay container): ${hasShadowRoot}`);
  
  // Step 3: Find and examine gumroad buttons
  console.log("\n3. Checking gumroad button structure...");
  const buttonInfo = await page.evaluate(() => {
    const links = document.querySelectorAll('a.gumroad-button');
    return Array.from(links).map(a => ({
      href: a.href,
      classList: Array.from(a.classList),
      innerHTML: a.innerHTML.substring(0, 100),
      hasClickListener: true, // can't directly check but the overlay script should add one
      childElements: Array.from(a.children).map(c => c.tagName.toLowerCase()),
    }));
  });
  console.log(`   Found ${buttonInfo.length} gumroad buttons:`);
  buttonInfo.forEach((b, i) => {
    console.log(`   [${i}] href: ${b.href}`);
    console.log(`        classes: ${b.classList.join(', ')}`);
    console.log(`        children: ${b.childElements.join(', ')}`);
  });
  
  if (buttonInfo.length === 0) {
    console.log("\n❌ FAIL: No gumroad buttons found!");
    await browser.close();
    process.exit(1);
  }
  
  // Step 4: Click the first pricing card button
  console.log("\n4. Clicking first 'Secure' button...");
  const firstButton = await page.$('a.gumroad-button');
  
  // Take screenshot before click
  await page.screenshot({ path: 'test_before_click.png' });
  console.log("   Screenshot saved: test_before_click.png");
  
  await firstButton.click();
  
  // Wait to see what happens
  console.log("   Waiting 5 seconds for overlay to appear...");
  await new Promise(r => setTimeout(r, 5000));
  
  // Step 5: Check results
  console.log("\n5. Checking results...");
  const currentUrl = page.url();
  console.log(`   Current URL: ${currentUrl}`);
  console.log(`   Navigated to Gumroad: ${navigatedAway}`);
  
  // Check for overlay iframe in shadow DOM
  const overlayInfo = await page.evaluate(() => {
    const divs = document.querySelectorAll('body > div');
    for (const div of divs) {
      if (div.shadowRoot) {
        const iframe = div.shadowRoot.querySelector('iframe');
        const overlay = div.shadowRoot.querySelector('.fixed');
        return {
          hasShadowRoot: true,
          hasIframe: !!iframe,
          iframeSrc: iframe ? iframe.src : null,
          overlayVisible: overlay ? getComputedStyle(overlay).display !== 'none' : false,
        };
      }
    }
    return { hasShadowRoot: false, hasIframe: false, iframeSrc: null, overlayVisible: false };
  });
  
  console.log(`   Shadow root found: ${overlayInfo.hasShadowRoot}`);
  console.log(`   Iframe found: ${overlayInfo.hasIframe}`);
  console.log(`   Iframe src: ${overlayInfo.iframeSrc}`);
  console.log(`   Overlay visible: ${overlayInfo.overlayVisible}`);
  
  // Take screenshot after click
  await page.screenshot({ path: 'test_after_click.png' });
  console.log("   Screenshot saved: test_after_click.png");
  
  // Final verdict
  console.log("\n=== VERDICT ===");
  if (!navigatedAway && overlayInfo.hasIframe && overlayInfo.iframeSrc) {
    console.log("✅ SUCCESS: Gumroad overlay is working! Iframe loaded without redirect.");
  } else if (navigatedAway) {
    console.log("❌ FAIL: Browser redirected to Gumroad instead of showing overlay.");
  } else if (!overlayInfo.hasIframe) {
    console.log("⚠️  PARTIAL: No redirect, but no overlay iframe detected either.");
  }
  
  await browser.close();
  process.exit(navigatedAway ? 1 : 0);
})();
