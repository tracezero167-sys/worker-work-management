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

  await page.goto('http://127.0.0.1:63227/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => ({
    title: document.title,
    totalWorkers: document.getElementById('totalWorkers')?.textContent,
    activeTasks: document.getElementById('activeTasks')?.textContent,
    completedTasks: document.getElementById('completedTasks')?.textContent,
    pendingTasks: document.getElementById('pendingTasks')?.textContent,
    workers: localStorage.getItem('workers'),
    appSettings: localStorage.getItem('appSettings')
  }));

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
