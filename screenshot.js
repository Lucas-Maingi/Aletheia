const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to 1920x1080
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('http://localhost:3000');
  
  // Wait for the "WATCH 2-MIN WALKTHROUGH" button to be visible
  await page.waitForSelector('button:has-text("Watch 2-Min Walkthrough")', { timeout: 10000 }).catch(() => {});
  // Click it if exists
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const demoBtn = btns.find(b => b.textContent.includes('WATCH 2-MIN WALKTHROUGH'));
    if (demoBtn) demoBtn.click();
  });
  
  // Wait for the demo container to load
  await new Promise(r => setTimeout(r, 2000));
  
  // Click "Start Autoplay Scan"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.textContent.includes('START AUTOPLAY SCAN'));
    if (startBtn) startBtn.click();
  });
  
  // Take screenshot at the start
  await page.screenshot({ path: 'C:/Users/Ghost/OpenVector/screenshot-start.png', fullPage: true });
  
  // Wait for it to progress (say, 5 seconds)
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'C:/Users/Ghost/OpenVector/screenshot-mid.png', fullPage: true });

  // Wait another 15 seconds to finish
  await new Promise(r => setTimeout(r, 20000));
  await page.screenshot({ path: 'C:/Users/Ghost/OpenVector/screenshot-end.png', fullPage: true });

  await browser.close();
})();
