const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const html = `
    <html>
      <head>
        <script src="https://gumroad.com/js/gumroad-embed.js"></script>
        <style>
          body { background: #000; color: #fff; }
          .modal { width: 500px; height: 600px; background: #fff; margin: 50px auto; border-radius: 10px; overflow: hidden; }
        </style>
      </head>
      <body>
        <div class="modal">
          <div class="gumroad-product-embed" data-gumroad-product-id="ukfec" data-outbound-links="false">
            <a href="https://lucas808.gumroad.com/l/ukfec">Loading...</a>
          </div>
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(html);
  
  console.log("Waiting for embed to load...");
  await new Promise(r => setTimeout(r, 6000));
  
  await page.screenshot({ path: 'embed_test_result.png' });
  console.log("Screenshot saved to embed_test_result.png");
  
  const iframes = await page.$$('iframe');
  console.log("Iframes: " + iframes.length);
  
  await browser.close();
  process.exit(0);
})();
