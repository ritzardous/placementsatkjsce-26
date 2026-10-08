import { randomBytes } from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { chromium, expect } from '@playwright/test';
import { createAdminTarget, safeMigrationError } from './firebase-admin.js';

// Trusted live smoke test: no email delivery or Google account interaction.
// Creates only its own randomly named user, and removes it even if checks fail.
let target: ReturnType<typeof createAdminTarget> | undefined;
let uid: string | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
try {
  target = createAdminTarget();
  if (target.emulator) throw new Error('Use test:firebase for isolated Auth tests.');
  const email = `migration-check-${randomBytes(12).toString('hex')}@example.test`;
  const password = randomBytes(24).toString('base64url');
  const user = await getAuth(target.app).createUser({ email, password, emailVerified: true });
  uid = user.uid;
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await expect(page.getByRole('heading', { name: /Placement Stats/ })).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in with email', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Account', exact: true })).toBeVisible({ timeout: 15000 });
  await page.reload();
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Placement Stats/ })).toBeVisible();
  console.log('Cloud Firebase email sign-in, reload persistence, sign-out, and public browsing passed.');
} catch (error) { console.error(safeMigrationError(error)); process.exitCode = 1; }
finally {
  await browser?.close();
  try {
    if (uid && target) { await getAuth(target.app).deleteUser(uid); console.log('Temporary cloud test account deleted.'); }
  } finally { await target?.close(); }
}
