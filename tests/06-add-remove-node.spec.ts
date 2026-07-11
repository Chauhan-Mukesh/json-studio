import { test, expect } from '@playwright/test';
import { loadApp, setEditor, getEditor } from './helpers';
import { editableSample } from './fixtures';

test('add new child key, rename it, delete another key', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, editableSample);
  // Add child on root: root node has data-path = "[]"
  const rootNode = page.locator('#tree .node[data-path="[]"]');
  await rootNode.hover();
  await rootNode.locator('> .row-actions .act-add').click({ force: true });
  const parsed1 = JSON.parse(await getEditor(page));
  expect(Object.keys(parsed1)).toContain('key');
  // Rename it to 'country' — new node's key is "key"
  const newKeyNode = page.locator('#tree .node[data-path=\'["key"]\']');
  await newKeyNode.locator('> .key').click();
  await page.locator('#tree .edit-input').fill('country');
  await page.locator('#tree .edit-input').press('Enter');
  const parsed2 = JSON.parse(await getEditor(page));
  expect(Object.keys(parsed2)).toContain('country');
  expect(Object.keys(parsed2)).not.toContain('key');
  // Delete the 'keep' key — target the specific node by data-path
  const keepNode = page.locator('#tree .node[data-path=\'["keep"]\']');
  await keepNode.hover();
  await keepNode.locator('> .row-actions .act-del').click({ force: true });
  const parsed3 = JSON.parse(await getEditor(page));
  expect(Object.keys(parsed3)).not.toContain('keep');
});
