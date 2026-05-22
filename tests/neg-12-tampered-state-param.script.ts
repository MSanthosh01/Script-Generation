import { test, expect } from '@playwright/test';

/**
 * NEG-12: Tampered state parameter — the state value is replaced with a random invalid string.
 * The app renders the email form (state is not validated client-side at page-load time;
 * it will only be validated during the OAuth callback). This test confirms the page renders
 * normally and does not crash with a tampered state.
 */
test('Negative - tampered state parameter renders login form', async ({ page }) => {
  await page.goto(
    'https://qa.wnut.ai/vscode-auth?state=invalidtamperedstate00000000000000000000000000000000000000000000'
  );
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  // The sign-in form should still render (state is validated on the server during callback)
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
});
