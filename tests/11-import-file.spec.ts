import { test, expect } from '@playwright/test';
import { loadApp, getEditor } from './helpers';

test('file input load populates editor', async ({ page }) => {
  await loadApp(page);
  const payload = { fromFile: true, arr: [1, 2, 3] };
  await page.locator('#file-input').setInputFiles({
    name: 'sample.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload, null, 2)),
  });
  await expect
    .poll(async () => {
      const t = await getEditor(page);
      try { return JSON.parse(t); } catch { return null; }
    })
    .toEqual(payload);
});
