import { test, expect } from '@playwright/test';

/**
 * NEG-13: Empty state parameter (?state=) — similar to a tampered state, the page should
 * load without crashing. The form may render or show an error depending on server behaviour.
 */
test('Negative - empty state parameter loads page without crash', async ({ page }) => {
  await page.goto('https://qa.wnut.ai/vscode-auth?state=');
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  // Page must render something visible — either the sign-in form or an error message
  const formVisible = await page.getByLabel('Email').isVisible().catch(() => false);
  const errorVisible = await page.getByText(/invalid|error|missing|required/i).first().isVisible().catch(() => false);
  const headingVisible = await page.getByRole('heading').first().isVisible().catch(() => false);
  expect(formVisible || errorVisible || headingVisible).toBeTruthy();
});
