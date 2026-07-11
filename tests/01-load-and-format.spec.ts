import { test, expect } from '@playwright/test';
import { loadApp, setEditor, getEditor } from './helpers';
import { smallJsonMinified, smallJsonPretty } from './fixtures';

test('loads app, formats minified JSON to indented output', async ({ page }) => {
  await loadApp(page);
  await expect(page.locator('.title')).toContainText('JSON Studio');
  await setEditor(page, smallJsonMinified);
  await page.locator('#btn-format').click();
  const out = await getEditor(page);
  expect(out).toBe(smallJsonPretty);
  await expect(page.locator('#status-text')).toContainText(/valid|ok|JSON/i);
});

test('editor textarea fills its container on default load', async ({ page }) => {
  await loadApp(page);
  const editor = await page.locator('#editor').boundingBox();
  const container = await page.locator('.editor-container').boundingBox();
  expect(editor).not.toBeNull();
  expect(container).not.toBeNull();
  expect(editor!.width).toBeGreaterThanOrEqual(container!.width - 2);
  expect(editor!.height).toBeGreaterThanOrEqual(container!.height - 2);
});
