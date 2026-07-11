import { test, expect } from '@playwright/test';
import { loadApp, setEditor, getEditor } from './helpers';

test('undo/redo restore edits', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { a: 1 });
  const step0 = await getEditor(page);
  // Change 1
  await setEditor(page, { a: 2 });
  const step1 = await getEditor(page);
  // Change 2
  await setEditor(page, { a: 2, b: 3 });
  const step2 = await getEditor(page);
  expect(step0).not.toBe(step1);
  expect(step1).not.toBe(step2);
  // Two undos
  await page.evaluate(() => (window as any).jsonStudio.undo());
  await page.evaluate(() => (window as any).jsonStudio.undo());
  const back = await getEditor(page);
  expect(back).toBe(step0);
  // One redo
  await page.evaluate(() => (window as any).jsonStudio.redo());
  const one = await getEditor(page);
  expect(one).toBe(step1);
});
