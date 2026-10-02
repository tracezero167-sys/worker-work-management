const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log('BROWSER_CONSOLE:', msg.type(), msg.text());
    }
  });

  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST_FAILED:', req.url(), req.failure() && req.failure().errorText));
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('HTTP_ERROR:', resp.status(), resp.url());
    }
  });

  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await browser.close();
})();
