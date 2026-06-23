const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set viewport to a typical desktop size
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to live URL pricing page...");
  // Load the live pricing page
  await page.goto('https://aletheia-live.vercel.app/pricing', { waitUntil: 'networkidle0' });

  console.log("Clicking 'Get Pro' button to navigate to checkout via native link...");
  await page.click('a[href="/checkout?plan=analyst_pro"]');
  
  // Wait for the checkout page to load
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log("Arrived at Checkout Page. URL: " + page.url());
  
  console.log("Filling in name and email...");
  await page.type('input[type="text"]', 'Test User');
  await page.type('input[type="email"]', 'test@example.com');
  
  console.log("Wait briefly to let React state update and render the <a> tag...");
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking the checkout button (gumroad-button)...");
  // Click the enabled gumroad button
  await page.click('a.gumroad-button');
  
  console.log("Waiting for 3 seconds to see if a redirect happens or if an iframe opens...");
  await new Promise(r => setTimeout(r, 3000));
  
  const currentUrl = page.url();
  console.log("Current URL after click: " + currentUrl);
  
  // Check if an iframe was injected into the body
  const iframes = await page.$$('iframe');
  console.log("Number of iframes on page: " + iframes.length);
  
  let success = false;
  if (currentUrl.includes('gumroad.com/checkout')) {
    console.log("FAILED: The page did a full redirect to gumroad.com!");
  } else if (iframes.length > 0) {
    console.log("SUCCESS: The URL did not change and an iframe was found! The modal overlay opened successfully.");
    success = true;
    
    // Let's take a screenshot to confirm it visually
    await page.screenshot({ path: 'overlay_test_result.png' });
    console.log("Screenshot saved to overlay_test_result.png");
  } else {
    console.log("UNKNOWN: The URL did not change, but no iframe was found.");
  }
  
  await browser.close();
  process.exit(success ? 0 : 1);
})();
