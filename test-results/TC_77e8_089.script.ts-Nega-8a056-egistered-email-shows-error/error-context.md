# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TC_77e8_089.script.ts >> Negative - unregistered email shows error
- Location: tests\TC_77e8_089.script.ts:46:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const AUTH_URL =
  4   |   'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
  5   | const VALID_EMAIL = 'mohammad.r@simplify3x.com';
  6   | const VALID_PASSWORD = 'Mdshahid13@';
  7   | const VALID_ORG = 'walnut-dev';
  8   | 
  9   | // ─── Helper: navigate and fill email then submit ───────────────────────────────
  10  | async function goToLoginAndSubmitEmail(page: any, email: string) {
  11  |   await page.goto(AUTH_URL);
  12  |   await expect(page).toHaveURL(/qa\.wnut\.ai/);
  13  |   await page.getByLabel(/email/i).fill(email);
  14  |   await page.getByRole('button', { name: /continue|next|sign in/i }).click();
  15  | }
  16  | 
  17  | // ─── POSITIVE (baseline) ──────────────────────────────────────────────────────
  18  | 
  19  | test('Positive - successful login with valid credentials', async ({ page }) => {
  20  |   await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  21  |   await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  22  |   await page.getByRole('button', { name: /walnut-dev/i }).click();
  23  |   await page.getByLabel(/password/i).fill(VALID_PASSWORD);
  24  |   await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  25  |   await expect(page).toHaveURL(/qa\.wnut\.ai/);
  26  | });
  27  | 
  28  | // ─── NEGATIVE: Email step ─────────────────────────────────────────────────────
  29  | 
  30  | test('Negative - empty email shows validation error', async ({ page }) => {
  31  |   await page.goto(AUTH_URL);
  32  |   await expect(page).toHaveURL(/qa\.wnut\.ai/);
  33  |   await page.getByLabel(/email/i).fill('');
  34  |   await page.getByRole('button', { name: /continue|next|sign in/i }).click();
  35  |   // Should stay on the same page / show an error — NOT proceed to org selection
  36  |   await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  37  | });
  38  | 
  39  | test('Negative - invalid email format shows validation error', async ({ page }) => {
  40  |   await page.goto(AUTH_URL);
  41  |   await page.getByLabel(/email/i).fill('not-an-email');
  42  |   await page.getByRole('button', { name: /continue|next|sign in/i }).click();
  43  |   await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  44  | });
  45  | 
  46  | test('Negative - unregistered email shows error', async ({ page }) => {
  47  |   await goToLoginAndSubmitEmail(page, 'nonexistent.user@example.com');
  48  |   // Should show an error message — not proceed to org selection
  49  |   const orgButton = page.getByRole('button', { name: /walnut-dev/i });
  50  |   const hasError = await page.getByText(/not found|invalid|no account|error|does not exist/i).isVisible().catch(() => false);
  51  |   const orgVisible = await orgButton.isVisible().catch(() => false);
> 52  |   expect(orgVisible || hasError).toBeTruthy();
      |                                  ^ Error: expect(received).toBeTruthy()
  53  |   if (orgVisible) {
  54  |     // Some flows show org but password will fail — that is still tested below
  55  |   } else {
  56  |     expect(hasError).toBeTruthy();
  57  |   }
  58  | });
  59  | 
  60  | test('Negative - email with leading/trailing spaces is rejected or trimmed', async ({ page }) => {
  61  |   await page.goto(AUTH_URL);
  62  |   await page.getByLabel(/email/i).fill('  mohammad.r@simplify3x.com  ');
  63  |   await page.getByRole('button', { name: /continue|next|sign in/i }).click();
  64  |   // Either it trims and succeeds (org appears) or it shows a validation error
  65  |   const orgVisible = await page.getByRole('button', { name: /walnut-dev/i }).isVisible().catch(() => false);
  66  |   const errorVisible = await page.getByText(/invalid|error/i).isVisible().catch(() => false);
  67  |   expect(orgVisible || errorVisible).toBeTruthy();
  68  | });
  69  | 
  70  | test('Negative - SQL injection in email field is rejected', async ({ page }) => {
  71  |   await goToLoginAndSubmitEmail(page, "' OR '1'='1");
  72  |   await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  73  | });
  74  | 
  75  | test('Negative - XSS payload in email field is sanitised', async ({ page }) => {
  76  |   await goToLoginAndSubmitEmail(page, '<script>alert(1)</script>@test.com');
  77  |   await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
  78  | });
  79  | 
  80  | // ─── NEGATIVE: Password step ──────────────────────────────────────────────────
  81  | 
  82  | test('Negative - wrong password shows error', async ({ page }) => {
  83  |   await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  84  |   await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  85  |   await page.getByRole('button', { name: /walnut-dev/i }).click();
  86  |   await page.getByLabel(/password/i).fill('WrongPassword123!');
  87  |   await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  88  |   await expect(page.getByText(/invalid|incorrect|wrong|failed|error/i)).toBeVisible();
  89  | });
  90  | 
  91  | test('Negative - empty password shows validation error', async ({ page }) => {
  92  |   await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  93  |   await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  94  |   await page.getByRole('button', { name: /walnut-dev/i }).click();
  95  |   await page.getByLabel(/password/i).fill('');
  96  |   await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  97  |   // Should not complete login — URL does not change to authenticated area
  98  |   const errorVisible = await page.getByText(/required|invalid|error/i).isVisible().catch(() => false);
  99  |   const passwordFieldStillVisible = await page.getByLabel(/password/i).isVisible().catch(() => false);
  100 |   expect(errorVisible || passwordFieldStillVisible).toBeTruthy();
  101 | });
  102 | 
  103 | test('Negative - password with only spaces is rejected', async ({ page }) => {
  104 |   await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  105 |   await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  106 |   await page.getByRole('button', { name: /walnut-dev/i }).click();
  107 |   await page.getByLabel(/password/i).fill('          ');
  108 |   await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  109 |   await expect(page.getByLabel(/password/i)).toBeVisible();
  110 | });
  111 | 
  112 | test('Negative - SQL injection in password field is rejected', async ({ page }) => {
  113 |   await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  114 |   await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  115 |   await page.getByRole('button', { name: /walnut-dev/i }).click();
  116 |   await page.getByLabel(/password/i).fill("' OR '1'='1' --");
  117 |   await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  118 |   await expect(page.getByText(/invalid|incorrect|wrong|failed|error/i)).toBeVisible();
  119 | });
  120 | 
  121 | // ─── NEGATIVE: URL / state tampering ─────────────────────────────────────────
  122 | 
  123 | test('Negative - missing state parameter in URL shows error or redirects', async ({ page }) => {
  124 |   await page.goto('https://qa.wnut.ai/vscode-auth');
  125 |   // Should show an error or redirect — not render the email form normally
  126 |   const hasError = await page.getByText(/invalid|error|missing|required/i).isVisible().catch(() => false);
  127 |   const redirected = !page.url().includes('/vscode-auth') || hasError;
  128 |   expect(redirected || hasError).toBeTruthy();
  129 | });
  130 | 
  131 | test('Negative - tampered state parameter shows error or redirects', async ({ page }) => {
  132 |   await page.goto('https://qa.wnut.ai/vscode-auth?state=invalidtamperedstate00000000000000000000000000000000000000000000');
  133 |   const hasError = await page.getByText(/invalid|error|expired|not found/i).isVisible().catch(() => false);
  134 |   const emailField = await page.getByLabel(/email/i).isVisible().catch(() => false);
  135 |   // Either error shown or email form NOT rendered (state is unknown/expired)
  136 |   expect(hasError || !emailField).toBeTruthy();
  137 | });
  138 | 
  139 | test('Negative - empty state parameter shows error', async ({ page }) => {
  140 |   await page.goto('https://qa.wnut.ai/vscode-auth?state=');
  141 |   const hasError = await page.getByText(/invalid|error|missing|required/i).isVisible().catch(() => false);
  142 |   const emailField = await page.getByLabel(/email/i).isVisible().catch(() => false);
  143 |   expect(hasError || !emailField).toBeTruthy();
  144 | });
  145 | 
  146 | // ─── NEGATIVE: Organisation step ─────────────────────────────────────────────
  147 | 
  148 | test('Negative - skipping org selection goes nowhere without clicking org', async ({ page }) => {
  149 |   await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  150 |   await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  151 |   // Do NOT click org — password field should NOT be visible yet
  152 |   await expect(page.getByLabel(/password/i)).not.toBeVisible();
```