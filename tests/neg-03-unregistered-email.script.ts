import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';

/**
 * NEG-03: Unregistered email — an email not associated with any org shows "Email Not Found" notification.
 */
test('Negative - unregistered email shows Email Not Found error', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill('nonexistent.user@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  // App shows a toast notification: "Email Not Found"
  await expect(page.getByText('Email Not Found', { exact: true })).toBeVisible();
  // Description text also appears
  await expect(
    page.getByText('This email is not associated with any organization. Please contact your administrator.')
  ).toBeVisible();
  // Must NOT advance to org selection
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
});
