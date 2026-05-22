import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';

/**
 * NEG-05: SQL injection payload in email field — should be rejected (invalid format or
 * "Email Not Found") and must never reach the org-selection step.
 */
test('Negative - SQL injection in email field is rejected', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill("' OR '1'='1");
  await page.getByRole('button', { name: 'Continue' }).click();
  // Must not advance to org selection
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  // Email field or an error must still be on screen
  const emailStillVisible = await page.getByLabel('Email').isVisible().catch(() => false);
  const errorVisible = await page.getByText('Email Not Found', { exact: true }).isVisible().catch(() => false);
  expect(emailStillVisible || errorVisible).toBeTruthy();
});
