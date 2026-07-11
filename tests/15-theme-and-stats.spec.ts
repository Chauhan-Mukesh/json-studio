import { test, expect } from '@playwright/test';
import { loadApp, setEditor } from './helpers';

test('theme toggle switches to dark and persists', async ({ page, context }) => {
  await loadApp(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#btn-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // Persist across reload
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // Reset
  await page.evaluate(() => localStorage.clear());
});

test('stats modal reports expected node counts', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { a: 1, b: [true, false, null], c: { d: 'x' } });
  await page.locator('#btn-stats').click();
  await expect(page.locator('#modal-stats')).toHaveClass(/open/);
  const rows = await page.locator('#stats-table tr').allInnerTexts();
  const nodesRow = rows.find((r) => r.startsWith('Nodes'));
  expect(nodesRow).toBeTruthy();
  // 1 root + a + b + 3 b-items + c + d = 8
  expect(nodesRow!).toMatch(/8/);
  // Booleans count = 2
  const boolRow = rows.find((r) => r.startsWith('Booleans'));
  expect(boolRow).toMatch(/2/);
});
