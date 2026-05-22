import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';

/**
 * NEG-04: Email with leading/trailing spaces — the app trims whitespace and submits the
 * lookup. The button switches to "Looking up..." (disabled) while processing, then either
 * succeeds (org list appears) or shows an error. Both outcomes are valid; the test confirms
 * the UI reacts (does not silently hang forever on the original "Continue" state).
 */
test('Negative - email with leading/trailing spaces is processed (trimmed or rejected)', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill('  mohammad.r@simplify3x.com  ');
  await page.getByRole('button', { name: 'Continue' }).click();

  // App immediately shows "Looking up..." — confirm the lookup was triggered
  await expect(page.getByRole('button', { name: 'Looking up...' })).toBeVisible();

  // Wait for lookup to finish — either org list appears or an error notification fires
  await Promise.race([
    page.getByRole('button', { name: /walnut-dev/i }).waitFor({ state: 'visible', timeout: 15000 }),
    page.getByText('Email Not Found', { exact: true }).waitFor({ state: 'visible', timeout: 15000 }),
  ]);

  // After resolution: org button visible (trimmed successfully) OR error shown
  const orgVisible = await page.getByRole('button', { name: /walnut-dev/i }).isVisible().catch(() => false);
  const errorVisible = await page.getByText('Email Not Found', { exact: true }).isVisible().catch(() => false);
  expect(orgVisible || errorVisible).toBeTruthy();
});
