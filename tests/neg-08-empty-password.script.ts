import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
const VALID_EMAIL = 'mohammad.r@simplify3x.com';

/**
 * NEG-08: Empty password — submitting with no password must not complete authentication.
 * Either a validation error appears or the password field remains visible.
 */
test('Negative - empty password does not complete login', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill(VALID_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill('');
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  // Password field must still be present — login did not succeed
  await expect(page.getByLabel(/password/i)).toBeVisible();
});
