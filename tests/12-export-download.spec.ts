import { test, expect } from '@playwright/test';
import { loadApp, setEditor } from './helpers';

test('save downloads current JSON as .json file', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { hello: 'world', ok: true });
  await page.locator('#btn-save').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button[data-act="save-file"]').click();
  const dl = await downloadPromise;
  const path = await dl.path();
  expect(path).toBeTruthy();
  const fs = await import('fs');
  const contents = fs.readFileSync(path!, 'utf-8');
  expect(JSON.parse(contents)).toEqual({ hello: 'world', ok: true });
});

test('save minified download strips whitespace', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { hello: 'world' });
  await page.locator('#btn-save').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button[data-act="save-minified"]').click();
  const dl = await downloadPromise;
  const path = await dl.path();
  const fs = await import('fs');
  const contents = fs.readFileSync(path!, 'utf-8');
  expect(contents.includes('\n')).toBeFalsy();
  expect(JSON.parse(contents)).toEqual({ hello: 'world' });
});
