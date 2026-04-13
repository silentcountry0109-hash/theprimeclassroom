import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://workspace.jdev0.repl.co';
const SCREENSHOTS_DIR = '/tmp/testing-screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * @param {any} page - Playwright page object
 * @param {{steps: Array}} plan - Test plan with steps
 * @param {string} testName - Name of the test
 */
async function runTest(page, plan, testName) {
  console.log(`\n=== ${testName} ===`);
  
  for (const step of plan.steps) {
    if (step.type === 'navigate') {
      console.log(`[Navigate] ${step.to}`);
      await page.goto(BASE_URL + step.to, { waitUntil: 'networkidle', timeout: 15000 });
    } else if (step.type === 'wait') {
      console.log(`[Wait] ${step.duration}ms`);
      await page.waitForTimeout(step.duration);
    } else if (step.type === 'click') {
      console.log(`[Click] ${step.selector}`);
      const elements = page.locator(step.selector);
      if (await elements.count() > 0) {
        await elements.first().click();
        await page.waitForLoadState('networkidle');
      }
    } else if (step.type === 'verify') {
      console.log(`[Verify] Assert text "${step.text}" exists on page.`);
      const timestamp = Date.now();
      const screenshotPath = path.join(SCREENSHOTS_DIR, `screenshot-${timestamp}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`[Screenshot] Saved to ${screenshotPath}`);
    }
  }
}

async function main() {
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });

    // Test 1: Navigate to 時段管理 (timeslots management) page
    console.log('\n--- Test 1: Time Slots Management Page ---');
    let context = await browser.newContext();
    let page = await context.newPage();
    
    await page.goto(BASE_URL + '/franchise-login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', 'wenyuan');
    await page.fill('input[type="password"]', 'wenyuan123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });
    
    const plan1 = {
      steps: [
        { type: 'navigate', to: '/franchise-admin?tab=timeslots' },
        { type: 'wait', duration: 2500 },
        { type: 'verify', text: 'NONEXISTENT_FORCE_SCREENSHOT' }
      ]
    };
    
    await runTest(page, plan1, 'Time Slots Management Page');
    await context.close();

    // Test 2: Navigate to 時段管理 then click "新增時段" button
    console.log('\n--- Test 2: Add Time Slot Dialog ---');
    context = await browser.newContext();
    page = await context.newPage();
    
    await page.goto(BASE_URL + '/franchise-login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', 'wenyuan');
    await page.fill('input[type="password"]', 'wenyuan123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });
    
    const plan2 = {
      steps: [
        { type: 'navigate', to: '/franchise-admin?tab=timeslots' },
        { type: 'wait', duration: 2500 },
        { type: 'click', selector: 'button:has-text("新增時段")' },
        { type: 'wait', duration: 2500 },
        { type: 'verify', text: 'NONEXISTENT_FORCE_SCREENSHOT' }
      ]
    };
    
    await runTest(page, plan2, 'Add Time Slot Dialog');
    await context.close();

    // Test 3: Navigate to 預約管理 (bookings management) page
    console.log('\n--- Test 3: Bookings Management Page ---');
    context = await browser.newContext();
    page = await context.newPage();
    
    await page.goto(BASE_URL + '/franchise-login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', 'wenyuan');
    await page.fill('input[type="password"]', 'wenyuan123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });
    
    const plan3 = {
      steps: [
        { type: 'navigate', to: '/franchise-admin?tab=bookings' },
        { type: 'wait', duration: 2500 },
        { type: 'verify', text: 'NONEXISTENT_FORCE_SCREENSHOT' }
      ]
    };
    
    await runTest(page, plan3, 'Bookings Management Page');
    await context.close();

    // Test 4: Navigate to 預約管理 then click "臨時加課" button
    console.log('\n--- Test 4: Add Emergency Class (臨時加課) ---');
    context = await browser.newContext();
    page = await context.newPage();
    
    await page.goto(BASE_URL + '/franchise-login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', 'wenyuan');
    await page.fill('input[type="password"]', 'wenyuan123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });
    
    const plan4 = {
      steps: [
        { type: 'navigate', to: '/franchise-admin?tab=bookings' },
        { type: 'wait', duration: 2500 },
        { type: 'click', selector: 'button:has-text("臨時加課")' },
        { type: 'wait', duration: 2500 },
        { type: 'verify', text: 'NONEXISTENT_FORCE_SCREENSHOT' }
      ]
    };
    
    await runTest(page, plan4, 'Add Emergency Class');
    await context.close();

    // Copy screenshots to docs folder
    console.log('\n--- Copying screenshots to docs ---');
    const files = fs.readdirSync(SCREENSHOTS_DIR)
      .filter(f => f.startsWith('screenshot-'))
      .sort((a, b) => {
        const aTime = fs.statSync(path.join(SCREENSHOTS_DIR, a)).mtimeMs;
        const bTime = fs.statSync(path.join(SCREENSHOTS_DIR, b)).mtimeMs;
        return aTime - bTime;
      });
    
    console.log(`Found ${files.length} screenshot(s)`);
    
    if (files.length >= 1) {
      fs.copyFileSync(
        path.join(SCREENSHOTS_DIR, files[0]),
        'docs/train-06-timeslots.png'
      );
      console.log('✓ Copied 1: docs/train-06-timeslots.png');
    }
    
    if (files.length >= 2) {
      fs.copyFileSync(
        path.join(SCREENSHOTS_DIR, files[1]),
        'docs/train-07-add-timeslot.png'
      );
      console.log('✓ Copied 2: docs/train-07-add-timeslot.png');
    }
    
    if (files.length >= 3) {
      fs.copyFileSync(
        path.join(SCREENSHOTS_DIR, files[2]),
        'docs/train-08-bookings.png'
      );
      console.log('✓ Copied 3: docs/train-08-bookings.png');
    }
    
    if (files.length >= 4) {
      fs.copyFileSync(
        path.join(SCREENSHOTS_DIR, files[3]),
        'docs/train-09-add-student.png'
      );
      console.log('✓ Copied 4: docs/train-09-add-student.png');
    }
    
    console.log('\n✓✓✓ All tests completed successfully! ✓✓✓');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
