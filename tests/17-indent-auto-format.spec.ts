import { test, expect } from '@playwright/test';
import { loadApp, setEditor, getEditor } from './helpers';

test('changing indent select auto-reformats valid JSON', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { a: 1, b: [1, 2] });
  const before = await getEditor(page);
  // Default is 2 spaces — flip to 4.
  await page.locator('#indent-select').selectOption('4');
  const after = await getEditor(page);
  expect(after).not.toBe(before);
  // 4-space indent line
  expect(after).toContain('    "a": 1');
  // Now switch to tab
  await page.locator('#indent-select').selectOption('tab');
  const tabbed = await getEditor(page);
  expect(tabbed).toContain('\t"a": 1');
});

test('changing indent with invalid JSON keeps text untouched', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, '{ "broken": ]');
  const before = await getEditor(page);
  await page.locator('#indent-select').selectOption('4');
  const after = await getEditor(page);
  expect(after).toBe(before);
});
