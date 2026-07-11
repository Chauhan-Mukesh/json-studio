import { test, expect } from '@playwright/test';
import { loadApp } from './helpers';

test('diff modal reports add / remove / change', async ({ page }) => {
  await loadApp(page);
  await page.locator('#btn-diff').click();
  await expect(page.locator('#modal-diff')).toHaveClass(/open/);
  await page.locator('#diff-a').fill(JSON.stringify({ a: 1, kept: 'x', removed: true }, null, 2));
  await page.locator('#diff-b').fill(JSON.stringify({ a: 2, kept: 'x', added: 99 }, null, 2));
  await page.locator('#diff-run').click();
  const out = page.locator('#diff-out');
  await expect(out.locator('.diff-add')).toHaveCount(1);
  await expect(out.locator('.diff-remove')).toHaveCount(1);
  await expect(out.locator('.diff-change')).toHaveCount(1);
  await expect(out).toContainText('added');
  await expect(out).toContainText('removed');
});
