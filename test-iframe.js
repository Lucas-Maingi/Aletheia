const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Test native iframe approach
  const html = `
    <html>
      <head>
        <style>
          body { background: #000; color: #fff; font-family: sans-serif; }
          .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
          }
          iframe {
            width: 100%; max-width: 500px; height: 600px; border: none; border-radius: 16px; background: #fff;
          }
        </style>
      </head>
      <body>
        <div class="modal-overlay">
          <iframe src="https://lucas808.gumroad.com/l/ukfec?email=test@example.com&wanted=true"></iframe>
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(html);
  
  console.log("Waiting for iframe to load...");
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({ path: 'iframe_test_result.png' });
  console.log("Screenshot saved to iframe_test_result.png");
  
  await browser.close();
  process.exit(0);
})();
