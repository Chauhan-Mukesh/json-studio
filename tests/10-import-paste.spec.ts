import { test, expect } from '@playwright/test';
import { loadApp, getEditor } from './helpers';

test('paste modal loads JSON into editor', async ({ page }) => {
  await loadApp(page);
  // Open the "Open" dropdown menu
  await page.locator('#btn-open').click();
  await page.locator('button[data-act="open-paste"]').click();
  await expect(page.locator('#modal-paste')).toHaveClass(/open/);
  const pastedJson = JSON.stringify({ from: 'paste', ok: true }, null, 2);
  await page.locator('#paste-area').fill(pastedJson);
  await page.locator('#paste-load').click();
  await expect(page.locator('#modal-paste')).not.toHaveClass(/open/);
  const parsed = JSON.parse(await getEditor(page));
  expect(parsed).toEqual({ from: 'paste', ok: true });
});
