import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
const VALID_EMAIL = 'mohammad.r@simplify3x.com';

/**
 * NEG-09: Password containing only spaces — should be treated as invalid/empty and
 * must not complete authentication.
 */
test('Negative - password with only spaces does not complete login', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill(VALID_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill('          ');
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  // Either "Login Failed" toast OR password field stays visible
  const loginFailed = await page.getByText('Login Failed', { exact: true }).isVisible().catch(() => false);
  const passwordStillVisible = await page.getByLabel(/password/i).isVisible().catch(() => false);
  expect(loginFailed || passwordStillVisible).toBeTruthy();
});
