const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const html = `
    <html>
      <head>
        <script src="https://gumroad.com/js/gumroad.js"></script>
      </head>
      <body>
        <a id="buy-button" href="https://lucas808.gumroad.com/l/ukfec" class="gumroad-button" data-gumroad-single-product="true">Buy Now</a>
      </body>
    </html>
  `;
  
  await page.setContent(html);
  
  console.log("Waiting for gumroad to initialize...");
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Clicking button...");
  await page.click('#buy-button');
  
  console.log("Waiting 4 seconds...");
  await new Promise(r => setTimeout(r, 4000));
  
  const currentUrl = page.url();
  const iframes = await page.$$('iframe');
  
  console.log("URL: " + currentUrl);
  console.log("Iframes: " + iframes.length);
  
  await browser.close();
  process.exit(iframes.length > 0 && !currentUrl.includes('gumroad.com/checkout') ? 0 : 1);
})();
