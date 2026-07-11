import { test, expect } from '@playwright/test';
import { loadApp, setEditor } from './helpers';
import { nestedJson } from './fixtures';

test('tree renders nested JSON and toggles expand/collapse', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, nestedJson);
  await expect(page.locator('#tree .node').first()).toBeVisible();
  // Target the "book" array by its exact data-path
  const bookNode = page.locator('#tree .node[data-path=\'["store","book"]\']');
  await expect(bookNode).toBeVisible();
  await expect(bookNode.locator('> .count').first()).toContainText('[4]');
  // Ensure "category" child rows are visible pre-collapse
  const categoryRows = page.locator('#tree .node[data-type="string"] .key').filter({ hasText: '"category"' });
  const beforeCount = await categoryRows.count();
  expect(beforeCount).toBeGreaterThanOrEqual(4);
  // Collapse the book node
  await bookNode.locator('> .toggle').first().click();
  await expect(bookNode).toHaveClass(/collapsed/);
  // After collapse, the category cells should not be visible
  const anyVisible = await categoryRows.evaluateAll((els) =>
    els.some((e) => (e as HTMLElement).offsetParent !== null),
  );
  expect(anyVisible).toBeFalsy();
  // Expand again
  await bookNode.locator('> .toggle').first().click();
  await expect(bookNode).not.toHaveClass(/collapsed/);
});
