import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';
import { mkdirSync, statSync } from 'node:fs';

mkdirSync('screenshots', { recursive: true });

const server = spawn('node', ['serve.ts', '--port', '8086'], { stdio: 'inherit' });

setTimeout(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const shots = [
      { name: 'screenshots/1-start.jpg', url: 'http://localhost:8086/?shot=start' },
      { name: 'screenshots/2-play.jpg', url: 'http://localhost:8086/?shot=play' },
      { name: 'screenshots/3-end.jpg', url: 'http://localhost:8086/?shot=end' },
    ];

    for (const shot of shots) {
      console.log(`Capturing ${shot.name}...`);
      await page.goto(shot.url, { waitUntil: 'networkidle0' });
      // Wait for Three.js to render a few frames
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: shot.name, type: 'jpeg', quality: 90 });
      const stats = statSync(shot.name);
      console.log(`${shot.name} size: ${stats.size} bytes`);
    }

    await browser.close();
    console.log('Screenshots re-captured successfully.');
  } catch (err) {
    console.error('Error capturing screenshots:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}, 1500);
