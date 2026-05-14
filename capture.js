const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  const downloaded = new Set();

  page.on('response', async (response) => {
    try {
      const url = response.url();

      if (
        url.includes('.js') ||
        url.includes('.css') ||
        url.includes('.png') ||
        url.includes('.jpg') ||
        url.includes('.svg') ||
        url.includes('.woff') ||
        url.includes('.woff2')
      ) {
        if (downloaded.has(url)) return;
        downloaded.add(url);

        const buffer = await response.body();

        const cleanPath = url
          .replace(/^https?:\/\//, '')
          .replace(/[?#].*$/, '');

        const filePath = path.join(__dirname, 'downloaded', cleanPath);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        fs.writeFileSync(filePath, buffer);

        console.log('Saved:', filePath);
      }
    } catch (err) {}
  });

  await page.goto('https://formance.framer.website/', {
    waitUntil: 'networkidle'
  });

  const html = await page.content();

  fs.mkdirSync('./downloaded', { recursive: true });
  fs.writeFileSync('./downloaded/index.html', html);

  await browser.close();

  console.log('Finished');
})();