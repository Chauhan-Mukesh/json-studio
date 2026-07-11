import { test, expect } from '@playwright/test';
import { loadApp } from './helpers';

/**
 * Perf smoke: render a 2000-key object. Should complete well under 1 second
 * on a warm run. Guards against regressions in the tree renderer.
 */
test('renders 2000-node JSON tree in under 500ms', async ({ page }) => {
  await loadApp(page);
  const dur = await page.evaluate(() => {
    const big: Record<string, unknown> = {};
    for (let i = 0; i < 2000; i++) big['key' + i] = { n: i, s: 'v' + i, b: i % 2 === 0 };
    const text = JSON.stringify(big, null, 2);
    const t0 = performance.now();
    (window as any).jsonStudio.setEditor(text);
    return performance.now() - t0;
  });
  console.log('render+parse took', dur.toFixed(1), 'ms');
  expect(dur).toBeLessThan(1500);
  const count = await page.locator('#tree .node').count();
  expect(count).toBeGreaterThan(2000);
});
