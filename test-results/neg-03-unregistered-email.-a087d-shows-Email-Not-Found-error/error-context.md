# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: neg-03-unregistered-email.script.ts >> Negative - unregistered email shows Email Not Found error
- Location: tests\neg-03-unregistered-email.script.ts:9:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('This email is not associated with any organization. Please contact your administrator.')
Expected: visible
Error: strict mode violation: getByText('This email is not associated with any organization. Please contact your administrator.') resolved to 2 elements:
    1) <div class="text-sm opacity-90">This email is not associated with any organizatio…</div> aka getByLabel('Notifications (F8)').getByText('This email is not associated')
    2) <span role="status" aria-live="assertive">Notification Email Not FoundThis email is not ass…</span> aka getByText('Notification Email Not')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('This email is not associated with any organization. Please contact your administrator.')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications (F8)":
      - list [ref=e4]:
        - listitem [ref=e5]:
          - img [ref=e6]
          - generic [ref=e8]:
            - generic [ref=e9]: Email Not Found
            - generic [ref=e10]: This email is not associated with any organization. Please contact your administrator.
          - button [ref=e11] [cursor=pointer]:
            - img [ref=e12]
    - region "Notifications alt+T"
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - img [ref=e22]
          - generic [ref=e32]:
            - heading "Walnut" [level=1] [ref=e33]
            - paragraph [ref=e34]: AI Project Assistant
        - paragraph [ref=e35]: Transform your project requirements with AI-powered insights
      - generic [ref=e36]:
        - generic [ref=e37]:
          - heading "Sign In" [level=3] [ref=e38]
          - paragraph [ref=e39]: Enter your email to continue
        - generic [ref=e41]:
          - generic [ref=e42]:
            - text: Email
            - textbox "Email" [ref=e43]:
              - /placeholder: you@company.com
              - text: nonexistent.user@example.com
          - button "Continue" [ref=e44] [cursor=pointer]:
            - generic [ref=e45]: Continue
      - paragraph [ref=e47]:
        - text: Don't have an account?
        - button "Start free trial" [ref=e48] [cursor=pointer]
  - status [ref=e49]: Notification Email Not FoundThis email is not associated with any organization. Please contact your administrator.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const AUTH_URL =
  4  |   'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
  5  | 
  6  | /**
  7  |  * NEG-03: Unregistered email — an email not associated with any org shows "Email Not Found" notification.
  8  |  */
  9  | test('Negative - unregistered email shows Email Not Found error', async ({ page }) => {
  10 |   await page.goto(AUTH_URL);
  11 |   await expect(page).toHaveURL(/qa\.wnut\.ai/);
  12 |   await page.getByLabel('Email').fill('nonexistent.user@example.com');
  13 |   await page.getByRole('button', { name: 'Continue' }).click();
  14 |   // App shows a toast notification: "Email Not Found"
  15 |   await expect(page.getByText('Email Not Found', { exact: true })).toBeVisible();
  16 |   // Description text also appears
  17 |   await expect(
  18 |     page.getByText('This email is not associated with any organization. Please contact your administrator.')
> 19 |   ).toBeVisible();
     |     ^ Error: expect(locator).toBeVisible() failed
  20 |   // Must NOT advance to org selection
  21 |   await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  22 | });
  23 | 
```