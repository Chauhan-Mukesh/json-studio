import { test, expect } from '@playwright/test';
import { loadApp, setEditor, getEditor } from './helpers';
import { smallJson, smallJsonMinified, smallJsonPretty } from './fixtures';

test('minify collapses to single line matching JSON.stringify', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, smallJsonPretty);
  await page.locator('#btn-minify').click();
  const out = await getEditor(page);
  expect(out).toBe(smallJsonMinified);
  expect(out.includes('\n')).toBeFalsy();
  expect(JSON.parse(out)).toEqual(smallJson);
});
