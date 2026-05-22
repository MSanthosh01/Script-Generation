import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';

/**
 * NEG-06: XSS payload in email field — the script tag must be sanitised and must not
 * execute. The org-selection step must not be reached.
 */
test('Negative - XSS payload in email field is sanitised and rejected', async ({ page }) => {
  // Listen for unexpected dialogs — a real XSS would fire alert()
  let dialogFired = false;
  page.on('dialog', async (dialog) => {
    dialogFired = true;
    await dialog.dismiss();
  });

  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel('Email').fill('<script>alert(1)</script>@test.com');
  await page.getByRole('button', { name: 'Continue' }).click();

  // No JavaScript alert must have fired
  expect(dialogFired).toBe(false);
  // Must not advance to org selection
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
});
