# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: neg-04-email-with-spaces.script.ts >> Negative - email with leading/trailing spaces is processed (trimmed or rejected)
- Location: tests\neg-04-email-with-spaces.script.ts:12:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Looking up...' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Looking up...' })

```

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- img
- heading "Walnut" [level=1]
- paragraph: AI Project Assistant
- paragraph: Transform your project requirements with AI-powered insights
- heading "Select Organization" [level=3]
- paragraph: mohammad.r@simplify3x.com
- paragraph: You belong to multiple organizations. Select one to continue.
- button "walnut-dev walnut-dev":
  - img
  - text: walnut-dev walnut-dev
  - img
- button "walnut walnut":
  - img
  - text: walnut walnut
  - img
- button "Sharma sharma":
  - img
  - text: Sharma sharma
  - img
- button "Use a different email":
  - img
  - text: Use a different email
- paragraph:
  - text: Don't have an account?
  - button "Start free trial"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const AUTH_URL =
  4  |   'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
  5  | 
  6  | /**
  7  |  * NEG-04: Email with leading/trailing spaces — the app trims whitespace and submits the
  8  |  * lookup. The button switches to "Looking up..." (disabled) while processing, then either
  9  |  * succeeds (org list appears) or shows an error. Both outcomes are valid; the test confirms
  10 |  * the UI reacts (does not silently hang forever on the original "Continue" state).
  11 |  */
  12 | test('Negative - email with leading/trailing spaces is processed (trimmed or rejected)', async ({ page }) => {
  13 |   await page.goto(AUTH_URL);
  14 |   await expect(page).toHaveURL(/qa\.wnut\.ai/);
  15 |   await page.getByLabel('Email').fill('  mohammad.r@simplify3x.com  ');
  16 |   await page.getByRole('button', { name: 'Continue' }).click();
  17 | 
  18 |   // App immediately shows "Looking up..." — confirm the lookup was triggered
> 19 |   await expect(page.getByRole('button', { name: 'Looking up...' })).toBeVisible();
     |                                                                     ^ Error: expect(locator).toBeVisible() failed
  20 | 
  21 |   // Wait for lookup to finish — either org list appears or an error notification fires
  22 |   await Promise.race([
  23 |     page.getByRole('button', { name: /walnut-dev/i }).waitFor({ state: 'visible', timeout: 15000 }),
  24 |     page.getByText('Email Not Found', { exact: true }).waitFor({ state: 'visible', timeout: 15000 }),
  25 |   ]);
  26 | 
  27 |   // After resolution: org button visible (trimmed successfully) OR error shown
  28 |   const orgVisible = await page.getByRole('button', { name: /walnut-dev/i }).isVisible().catch(() => false);
  29 |   const errorVisible = await page.getByText('Email Not Found', { exact: true }).isVisible().catch(() => false);
  30 |   expect(orgVisible || errorVisible).toBeTruthy();
  31 | });
  32 | 
```