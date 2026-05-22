import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
const VALID_EMAIL = 'mohammad.r@simplify3x.com';

/**
 * NEG-10: SQL injection in password field — the payload must not bypass authentication.
 * App must respond with "Login Failed" notification.
 */
test('Negative - SQL injection in password field shows Login Failed error', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill(VALID_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill("' OR '1'='1' --");
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  await expect(page.getByText('Login Failed', { exact: true })).toBeVisible();
  await expect(page.getByText('Email or password is incorrect', { exact: true })).toBeVisible();
});
