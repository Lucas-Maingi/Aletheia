const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Create a minimal HTML page with just the gumroad script and a clean link
  const html = `
    <html>
      <head>
        <script src="https://gumroad.com/js/gumroad.js"></script>
      </head>
      <body>
        <a id="clean-link" href="https://lucas808.gumroad.com/l/ukfec" class="gumroad-button">Clean Link</a>
        <a id="dirty-link" href="https://lucas808.gumroad.com/l/ukfec?email=test@example.com&wanted=true" class="gumroad-button">Dirty Link</a>
      </body>
    </html>
  `;
  
  await page.setContent(html);
  
  // Wait for gumroad to initialize
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Testing Clean Link...");
  await page.click('#clean-link');
  await new Promise(r => setTimeout(r, 3000));
  
  let iframes = await page.$$('iframe');
  console.log("Clean link iframes: " + iframes.length);
  console.log("Clean link URL: " + page.url());
  
  // Reload page
  await page.setContent(html);
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Testing Dirty Link...");
  await page.click('#dirty-link');
  await new Promise(r => setTimeout(r, 3000));
  
  iframes = await page.$$('iframe');
  console.log("Dirty link iframes: " + iframes.length);
  console.log("Dirty link URL: " + page.url());
  
  await browser.close();
  process.exit(0);
})();
