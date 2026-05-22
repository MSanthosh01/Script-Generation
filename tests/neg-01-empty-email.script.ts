import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';

/**
 * NEG-01: Empty email — clicking Continue with no email entered should not advance to org selection.
 */
test('Negative - empty email does not proceed to org selection', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill('');
  await page.getByRole('button', { name: 'Continue' }).click();
  // Page must stay at email step — org button must not appear
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  // Email textbox must still be present
  await expect(page.getByLabel('Email')).toBeVisible();
});
