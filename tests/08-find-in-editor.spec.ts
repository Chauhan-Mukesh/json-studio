import { test, expect } from '@playwright/test';
import { loadApp, setEditor } from './helpers';

test('find counts matches and navigates', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { count: 1, discount: 2, uncounted: 3 });
  await page.locator('#find-input').fill('count');
  await expect(page.locator('#find-count')).toContainText(/of 3/, { timeout: 2000 });
  await page.locator('#find-input').press('Enter');
  await expect(page.locator('#find-count')).toContainText(/of 3/);
});

test('typing in find keeps caret in the find field (no focus steal)', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { count: 1, discount: 2, uncounted: 3 });
  await page.locator('#find-input').focus();
  await page.locator('#find-input').fill('count');
  await expect(page.locator('#find-count')).toContainText(/of 3/, { timeout: 2000 });
  const activeId = await page.evaluate(() => document.activeElement && (document.activeElement as HTMLElement).id);
  expect(activeId).toBe('find-input');
  // Overlay draws one <mark> per match; first match is .current.
  const marks = page.locator('#editor-highlight mark');
  await expect(marks).toHaveCount(3);
  await expect(marks.first()).toHaveClass(/current/);
  await expect(marks.first()).toHaveText('count');
});

test('Enter in find navigates matches without stealing focus', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { count: 1, discount: 2, uncounted: 3 });
  await page.locator('#find-input').fill('count');
  await expect(page.locator('#find-count')).toContainText('1 of 3', { timeout: 2000 });
  await page.locator('#find-input').press('Enter');
  await expect(page.locator('#find-count')).toContainText('2 of 3');
  const activeId = await page.evaluate(() => document.activeElement && (document.activeElement as HTMLElement).id);
  expect(activeId).toBe('find-input');
});

test('Escape from find hands focus to editor', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { count: 1 });
  await page.locator('#find-input').fill('count');
  await page.locator('#find-input').press('Escape');
  const activeId = await page.evaluate(() => document.activeElement && (document.activeElement as HTMLElement).id);
  expect(activeId).toBe('editor');
});

test('find highlight marks land inside the editor textarea (geometry regression)', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, { count: 1, discount: 2, uncounted: 3 });
  await page.locator('#find-input').fill('count');
  await expect(page.locator('#find-count')).toContainText(/of 3/, { timeout: 2000 });

  const editorBox = await page.locator('#editor').boundingBox();
  expect(editorBox).not.toBeNull();
  const marks = page.locator('#editor-highlight mark');
  const n = await marks.count();
  expect(n).toBe(3);
  for (let i = 0; i < n; i++) {
    const mb = await marks.nth(i).boundingBox();
    expect(mb).not.toBeNull();
    expect(mb!.y).toBeGreaterThanOrEqual(editorBox!.y - 1);
    expect(mb!.y + mb!.height).toBeLessThanOrEqual(editorBox!.y + editorBox!.height + 1);
    expect(mb!.x).toBeGreaterThanOrEqual(editorBox!.x - 1);
    expect(mb!.x + mb!.width).toBeLessThanOrEqual(editorBox!.x + editorBox!.width + 1);
  }
});
