import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
const VALID_EMAIL = 'mohammad.r@simplify3x.com';

/**
 * NEG-14: Skip org selection — after email lookup reveals the org list, NOT clicking
 * the org must keep the password field hidden (flow is gated behind org selection).
 */
test('Negative - skipping org selection keeps password field hidden', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill(VALID_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();
  // Org button must be visible
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  // Password field must NOT be visible until org is selected
  await expect(page.getByLabel(/password/i)).not.toBeVisible();
});
