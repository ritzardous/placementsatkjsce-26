import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const origin = process.env.PREVIEW_ORIGIN ?? 'http://127.0.0.1:5173';
const year = Number(process.env.PREVIEW_YEAR ?? 2026);
if (![2025, 2026, 2027].includes(year)) throw new Error('Unsupported preview year.');
const route = name => `${origin}/#${year === 2026 ? '' : `${year}/`}${name}`;
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, viewport] of [['desktop', { width: 1440, height: 1100 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    const apiRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url().includes('/api/v1/') || request.url().includes(':3001')) apiRequests.push(request.url()); });
    await page.goto(route('overview'));
    await page.getByRole('heading', { name: /Placement Stats/ }).waitFor();
    await page.screenshot({ path: `artifacts/${year}-${name}-overview.png`, fullPage: true });
    for (const route of ['companies', 'company/barclays', 'branches/IT', 'candidates', 'timeline', 'insights']) {
      await page.goto(`${origin}/#${year === 2026 ? '' : `${year}/`}${route}`);
      await page.locator('.source-notes').waitFor();
      await page.screenshot({ path: `artifacts/${year}-${name}-${route.replace('/', '-')}.png`, fullPage: route !== 'timeline' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Horizontal overflow: ${name} ${route}`);
    }
    if (errors.length) throw new Error(errors.join('\n'));
    if (apiRequests.length) throw new Error('Unexpected legacy backend request.');
    console.log(`${year} ${name}: all Firebase dashboard routes rendered without browser exceptions, Express requests, or horizontal overflow.`);
    await page.close();
  }
} finally { await browser.close(); }
