import { test, expect } from '@playwright/test';
import { loadApp, setEditor } from './helpers';
import { brokenJson } from './fixtures';

test('invalid JSON surfaces a line/col error in status bar', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, brokenJson);
  await expect(page.locator('#status-text')).toContainText(/error/i, { timeout: 2000 });
  await expect(page.locator('#status-msg')).toHaveClass(/status-err/);
  const err = await page.evaluate(() => (window as any).jsonStudio.getState().parseError);
  expect(err).toBeTruthy();
  expect(err.line).toBeGreaterThanOrEqual(1);
});

test('valid JSON clears error state and shows valid', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { hello: 'world' });
  await expect(page.locator('#status-msg')).toHaveClass(/status-ok/);
  await expect(page.locator('#status-text')).toContainText(/valid/i);
});
