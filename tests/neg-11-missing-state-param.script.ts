import { test, expect } from '@playwright/test';

/**
 * NEG-11: Missing state parameter — navigating to /vscode-auth with no state query param.
 * The app may redirect, show an error, or render the login form (depending on server behaviour).
 * This test verifies the page loads without crashing and the URL is on qa.wnut.ai.
 */
test('Negative - missing state parameter loads page without crash', async ({ page }) => {
  await page.goto('https://qa.wnut.ai/vscode-auth');
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  // Page must render something — heading or error message
  const hasHeading = await page.getByRole('heading').first().isVisible().catch(() => false);
  const hasError = await page.getByText(/invalid|error|missing|required/i).first().isVisible().catch(() => false);
  expect(hasHeading || hasError).toBeTruthy();
});
