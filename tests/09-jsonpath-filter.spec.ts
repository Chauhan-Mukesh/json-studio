import { test, expect } from '@playwright/test';
import { loadApp, setEditor } from './helpers';
import { nestedJson } from './fixtures';

test('JSONPath returns all book titles', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, nestedJson);
  const result = await page.evaluate(() =>
    (window as any).jsonStudio.jsonPath('$.store.book[*].title'),
  );
  expect(result).toHaveLength(4);
  expect(result.map((r: any) => r.value)).toEqual([
    'Sayings',
    'Sword of Honour',
    'Moby Dick',
    'The Lord of the Rings',
  ]);
});

test('JSONPath filter with predicate returns fiction books', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, nestedJson);
  const result = await page.evaluate(() =>
    (window as any).jsonStudio.jsonPath("$.store.book[?(@.category=='fiction')].title"),
  );
  expect(result.map((r: any) => r.value)).toEqual([
    'Sword of Honour',
    'Moby Dick',
    'The Lord of the Rings',
  ]);
});

test('JSONPath UI populates result list and count', async ({ page }) => {
  await loadApp(page);
  await setEditor(page, nestedJson);
  await page.locator('#jp-input').fill('$.store.book[*].title');
  await page.locator('#jp-run').click();
  await expect(page.locator('#jp-count')).toHaveText('4 matches');
  await expect(page.locator('#jp-results .jp-row')).toHaveCount(4);
});
