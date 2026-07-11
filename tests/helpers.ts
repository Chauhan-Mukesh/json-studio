import { Page, expect } from '@playwright/test';

export const APP_URL = '/json-studio.html';

/** Load the app and wait until the internal API is ready. */
export async function loadApp(page: Page) {
  await page.goto(APP_URL);
  await expect
    .poll(async () => await page.evaluate(() => typeof (window as any).jsonStudio))
    .toBe('object');
}

/** Set editor content via exposed test hook and flush the sync. */
export async function setEditor(page: Page, obj: unknown) {
  const text = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  await page.evaluate((t) => (window as any).jsonStudio.setEditor(t), text);
}

export async function getEditor(page: Page) {
  return await page.evaluate(() => (window as any).jsonStudio.getEditor());
}

export async function getParsed(page: Page) {
  return await page.evaluate(() => (window as any).jsonStudio.getParsed());
}
