import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://workspace.jdev0.repl.co';
const SCREENSHOTS_DIR = '/tmp/testing-screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test('Test 1: Time Slots Management', async ({ page }) => {
  // Login
  await page.goto(BASE_URL + '/franchise-login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"]', 'wenyuan');
  await page.fill('input[type="password"]', 'wenyuan123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });

  // Navigate to timeslots
  await page.goto(BASE_URL + '/franchise-admin?tab=timeslots');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  // Take screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, 'test-1.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot 1 saved');
});

test('Test 2: Add Time Slot Dialog', async ({ page }) => {
  // Login
  await page.goto(BASE_URL + '/franchise-login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"]', 'wenyuan');
  await page.fill('input[type="password"]', 'wenyuan123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });

  // Navigate to timeslots
  await page.goto(BASE_URL + '/franchise-admin?tab=timeslots');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  // Click add button
  const buttons = page.locator('button:has-text("新增時段")');
  if (await buttons.count() > 0) {
    await buttons.first().click();
    await page.waitForLoadState('networkidle');
  }
  await page.waitForTimeout(2500);

  // Take screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, 'test-2.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot 2 saved');
});

test('Test 3: Bookings Management', async ({ page }) => {
  // Login
  await page.goto(BASE_URL + '/franchise-login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"]', 'wenyuan');
  await page.fill('input[type="password"]', 'wenyuan123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });

  // Navigate to bookings
  await page.goto(BASE_URL + '/franchise-admin?tab=bookings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  // Take screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, 'test-3.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot 3 saved');
});

test('Test 4: Add Emergency Class', async ({ page }) => {
  // Login
  await page.goto(BASE_URL + '/franchise-login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"]', 'wenyuan');
  await page.fill('input[type="password"]', 'wenyuan123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*franchise-admin/, { timeout: 15000 });

  // Navigate to bookings
  await page.goto(BASE_URL + '/franchise-admin?tab=bookings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  // Click emergency class button
  const buttons = page.locator('button:has-text("臨時加課")');
  if (await buttons.count() > 0) {
    await buttons.first().click();
    await page.waitForLoadState('networkidle');
  }
  await page.waitForTimeout(2500);

  // Take screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, 'test-4.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot 4 saved');
});
