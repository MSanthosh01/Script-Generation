import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
const VALID_EMAIL = 'mohammad.r@simplify3x.com';

/**
 * NEG-07: Wrong password — after correct email + org selection, an incorrect password
 * must show a "Login Failed" notification with "Email or password is incorrect".
 */
test('Negative - wrong password shows Login Failed error', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill(VALID_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill('WrongPassword999!');
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  // App shows toast notification: "Login Failed"
  await expect(page.getByText('Login Failed', { exact: true })).toBeVisible();
  await expect(page.getByText('Email or password is incorrect', { exact: true })).toBeVisible();
  // Password field must still be visible — not logged in
  await expect(page.getByLabel(/password/i)).toBeVisible();
});
