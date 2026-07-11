import { test, expect } from '@playwright/test';
import { loadApp } from './helpers';

test('convert: JSON array of objects to CSV', async ({ page }) => {
  await loadApp(page);
  const csv = await page.evaluate(() =>
    (window as any).jsonStudio.toCSV([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]),
  );
  expect(csv.trim().split('\n')).toEqual(['name,age', 'Alice,30', 'Bob,25']);
});

test('convert: CSV -> JSON round-trip', async ({ page }) => {
  await loadApp(page);
  const result = await page.evaluate(() =>
    (window as any).jsonStudio.fromCSV('name,age\nAlice,30\nBob,25'),
  );
  expect(result).toEqual([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ]);
});

test('convert: JSON -> YAML', async ({ page }) => {
  await loadApp(page);
  const yaml = await page.evaluate(() =>
    (window as any).jsonStudio.toYAML({ name: 'Alice', tags: ['a', 'b'] }),
  );
  expect(yaml).toContain('name: Alice');
  expect(yaml).toContain('- a');
  expect(yaml).toContain('- b');
});

test('convert: JSON -> XML', async ({ page }) => {
  await loadApp(page);
  const xml = await page.evaluate(() =>
    (window as any).jsonStudio.toXML({ name: 'Alice', age: 30 }),
  );
  expect(xml).toContain('<name>Alice</name>');
  expect(xml).toContain('<age>30</age>');
});

test('convert UI: fill from current + convert JSON -> CSV works end-to-end', async ({ page }) => {
  await loadApp(page);
  await page.evaluate(() =>
    (window as any).jsonStudio.setEditor(
      JSON.stringify([{ a: 1, b: 'x' }, { a: 2, b: 'y' }]),
    ),
  );
  await page.locator('#btn-convert').click();
  await expect(page.locator('#modal-convert')).toHaveClass(/open/);
  await page.locator('#conv-load-current').click();
  await page.locator('#conv-to').selectOption('csv');
  await page.locator('#conv-run').click();
  const out = await page.locator('#conv-out').inputValue();
  expect(out.split('\n')).toEqual(['a,b', '1,x', '2,y']);
});
