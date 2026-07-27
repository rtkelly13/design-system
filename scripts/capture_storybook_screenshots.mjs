import { chromium } from '@playwright/test';
import http from 'http';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/ryankelly/.gemini/antigravity-cli/brain/55f69930-d5b7-4dda-9e10-0e9763ede4a4';
const STORYBOOK_STATIC = path.resolve(process.cwd(), 'storybook-static');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  const filePath = path.join(STORYBOOK_STATIC, reqUrl);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  fs.createReadStream(filePath).pipe(res);
});

server.listen(6007, async () => {
  console.log('Static server running on http://localhost:6007');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const stories = [
    { name: 'storybook_design_sandbox_components.png', url: 'http://localhost:6007/iframe.html?id=showcase-designsandbox--default-sandbox&viewMode=story' },
    { name: 'storybook_saas_landing_page.png', url: 'http://localhost:6007/iframe.html?id=saas-landingpage--default-landing-page&viewMode=story' },
    { name: 'storybook_admin_dashboard.png', url: 'http://localhost:6007/iframe.html?id=saas-admindashboardlayout--default-admin-dashboard&viewMode=story' },
    { name: 'storybook_editorial_blog_post.png', url: 'http://localhost:6007/iframe.html?id=blog-loremipsumpost--foundational-blog-post&viewMode=story' },
    { name: 'storybook_presentation_slidedeck.png', url: 'http://localhost:6007/iframe.html?id=presentation-slidedeck--default-deck&viewMode=story' },
  ];

  for (const story of stories) {
    console.log(`Capturing ${story.name}...`);
    await page.goto(story.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const destPath = path.join(ARTIFACT_DIR, story.name);
    await page.screenshot({ path: destPath, fullPage: true });
    console.log(`Saved screenshot to ${destPath}`);
  }

  await browser.close();
  server.close();
  console.log('All screenshots captured successfully!');
});
