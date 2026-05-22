import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';

/**
 * NEG-02: Invalid email format — a value without "@" and domain should be rejected before org lookup.
 */
test('Negative - invalid email format does not proceed to org selection', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Continue' }).click();
  // Must not navigate to org-selection step
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  // Must still show email field
  await expect(page.getByLabel('Email')).toBeVisible();
});
