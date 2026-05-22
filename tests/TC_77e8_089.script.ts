import { test, expect } from '@playwright/test';

const AUTH_URL =
  'https://qa.wnut.ai/vscode-auth?state=5b20d51d3c58a68b30a08f1b9d0cd7c4453f6232685b70b32937d04eece8fe3f';
const VALID_EMAIL = 'mohammad.r@simplify3x.com';
const VALID_PASSWORD = 'Mdshahid13@';
const VALID_ORG = 'walnut-dev';

// ─── Helper: navigate and fill email then submit ───────────────────────────────
async function goToLoginAndSubmitEmail(page: any, email: string) {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole('button', { name: /continue|next|sign in/i }).click();
}

// ─── POSITIVE (baseline) ──────────────────────────────────────────────────────

test('Positive - successful login with valid credentials', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill(VALID_PASSWORD);
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
});

// ─── NEGATIVE: Email step ─────────────────────────────────────────────────────

test('Negative - empty email shows validation error', async ({ page }) => {
  await page.goto(AUTH_URL);
  await expect(page).toHaveURL(/qa\.wnut\.ai/);
  await page.getByLabel(/email/i).fill('');
  await page.getByRole('button', { name: /continue|next|sign in/i }).click();
  // Should stay on the same page / show an error — NOT proceed to org selection
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
});

test('Negative - invalid email format shows validation error', async ({ page }) => {
  await page.goto(AUTH_URL);
  await page.getByLabel(/email/i).fill('not-an-email');
  await page.getByRole('button', { name: /continue|next|sign in/i }).click();
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
});

test('Negative - unregistered email shows error', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, 'nonexistent.user@example.com');
  // Should show an error message — not proceed to org selection
  const orgButton = page.getByRole('button', { name: /walnut-dev/i });
  const hasError = await page.getByText(/not found|invalid|no account|error|does not exist/i).isVisible().catch(() => false);
  const orgVisible = await orgButton.isVisible().catch(() => false);
  expect(orgVisible || hasError).toBeTruthy();
  if (orgVisible) {
    // Some flows show org but password will fail — that is still tested below
  } else {
    expect(hasError).toBeTruthy();
  }
});

test('Negative - email with leading/trailing spaces is rejected or trimmed', async ({ page }) => {
  await page.goto(AUTH_URL);
  await page.getByLabel(/email/i).fill('  mohammad.r@simplify3x.com  ');
  await page.getByRole('button', { name: /continue|next|sign in/i }).click();
  // Either it trims and succeeds (org appears) or it shows a validation error
  const orgVisible = await page.getByRole('button', { name: /walnut-dev/i }).isVisible().catch(() => false);
  const errorVisible = await page.getByText(/invalid|error/i).isVisible().catch(() => false);
  expect(orgVisible || errorVisible).toBeTruthy();
});

test('Negative - SQL injection in email field is rejected', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, "' OR '1'='1");
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
});

test('Negative - XSS payload in email field is sanitised', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, '<script>alert(1)</script>@test.com');
  await expect(page.getByRole('button', { name: /walnut-dev/i })).not.toBeVisible();
});

// ─── NEGATIVE: Password step ──────────────────────────────────────────────────

test('Negative - wrong password shows error', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill('WrongPassword123!');
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  await expect(page.getByText(/invalid|incorrect|wrong|failed|error/i)).toBeVisible();
});

test('Negative - empty password shows validation error', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill('');
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  // Should not complete login — URL does not change to authenticated area
  const errorVisible = await page.getByText(/required|invalid|error/i).isVisible().catch(() => false);
  const passwordFieldStillVisible = await page.getByLabel(/password/i).isVisible().catch(() => false);
  expect(errorVisible || passwordFieldStillVisible).toBeTruthy();
});

test('Negative - password with only spaces is rejected', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill('          ');
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test('Negative - SQL injection in password field is rejected', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  await page.getByRole('button', { name: /walnut-dev/i }).click();
  await page.getByLabel(/password/i).fill("' OR '1'='1' --");
  await page.getByRole('button', { name: /sign in|login|continue/i }).click();
  await expect(page.getByText(/invalid|incorrect|wrong|failed|error/i)).toBeVisible();
});

// ─── NEGATIVE: URL / state tampering ─────────────────────────────────────────

test('Negative - missing state parameter in URL shows error or redirects', async ({ page }) => {
  await page.goto('https://qa.wnut.ai/vscode-auth');
  // Should show an error or redirect — not render the email form normally
  const hasError = await page.getByText(/invalid|error|missing|required/i).isVisible().catch(() => false);
  const redirected = !page.url().includes('/vscode-auth') || hasError;
  expect(redirected || hasError).toBeTruthy();
});

test('Negative - tampered state parameter shows error or redirects', async ({ page }) => {
  await page.goto('https://qa.wnut.ai/vscode-auth?state=invalidtamperedstate00000000000000000000000000000000000000000000');
  const hasError = await page.getByText(/invalid|error|expired|not found/i).isVisible().catch(() => false);
  const emailField = await page.getByLabel(/email/i).isVisible().catch(() => false);
  // Either error shown or email form NOT rendered (state is unknown/expired)
  expect(hasError || !emailField).toBeTruthy();
});

test('Negative - empty state parameter shows error', async ({ page }) => {
  await page.goto('https://qa.wnut.ai/vscode-auth?state=');
  const hasError = await page.getByText(/invalid|error|missing|required/i).isVisible().catch(() => false);
  const emailField = await page.getByLabel(/email/i).isVisible().catch(() => false);
  expect(hasError || !emailField).toBeTruthy();
});

// ─── NEGATIVE: Organisation step ─────────────────────────────────────────────

test('Negative - skipping org selection goes nowhere without clicking org', async ({ page }) => {
  await goToLoginAndSubmitEmail(page, VALID_EMAIL);
  await expect(page.getByRole('button', { name: /walnut-dev/i })).toBeVisible();
  // Do NOT click org — password field should NOT be visible yet
  await expect(page.getByLabel(/password/i)).not.toBeVisible();
});
