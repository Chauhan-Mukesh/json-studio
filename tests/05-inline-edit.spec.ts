import { test, expect } from '@playwright/test';
import { loadApp, setEditor, getEditor } from './helpers';
import { editableSample } from './fixtures';

test('inline edit changes a string value and updates editor', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, editableSample);
  // Target the value for the "city" key by its data-path
  const cityNode = page.locator('#tree .node[data-path=\'["city"]\']');
  const valEl = cityNode.locator('> .val.str');
  await expect(valEl).toBeVisible();
  await valEl.click();
  const input = page.locator('#tree .edit-input');
  await expect(input).toBeVisible();
  await input.fill('Mumbai');
  await input.press('Enter');
  const parsed = JSON.parse(await getEditor(page));
  expect(parsed.city).toBe('Mumbai');
  await expect(
    page.locator('#tree .node[data-path=\'["city"]\'] > .val.str'),
  ).toContainText('Mumbai');
});

test('inline edit changes a number value', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, editableSample);
  const countNode = page.locator('#tree .node[data-path=\'["count"]\']');
  await countNode.locator('> .val.num').click();
  await page.locator('#tree .edit-input').fill('99');
  await page.locator('#tree .edit-input').press('Enter');
  const parsed = JSON.parse(await getEditor(page));
  expect(parsed.count).toBe(99);
});
