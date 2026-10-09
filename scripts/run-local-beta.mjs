import { spawn } from 'node:child_process';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw new Error('This beta requires isolated local emulators.');
async function run(args, env = process.env) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: 'inherit' });
    child.on('error', reject); child.on('exit', resolve);
  });
  if (code !== 0) throw new Error('Local beta operation failed.');
}
for (const year of [2025, 2026, 2027]) await run(['node_modules/tsx/dist/cli.mjs', 'scripts/seed-firestore.ts', '--year', String(year), '--emulator']);
await run(['node_modules/tsx/dist/cli.mjs', 'scripts/seed-procedure-companies.ts', '--emulator']);
const app = initializeApp({ projectId: 'demo-placementstats' });
const users = ['contributor', 'admin', 'reader'].map(role => ({
  uid: `local-beta-${role}`, email: `${role}@local-beta.test`, emailVerified: true,
  displayName: `Beta ${role}`, customClaims: role === 'admin' ? { role: 'admin' } : {},
  providerData: [{ uid: `local-beta-${role}`, providerId: 'google.com', email: `${role}@local-beta.test`, displayName: `Beta ${role}` }],
}));
const result = await getAuth(app).importUsers(users);
if (result.failureCount) throw new Error('Could not initialize local test accounts.');
console.log('\nLocal beta ready at http://localhost:5174 — use the Contributor, Admin and Reader buttons.\n');
await run(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], {
  ...process.env, VITE_USE_FIREBASE_EMULATORS: 'true', VITE_LOCAL_BETA: 'true',
  VITE_FIREBASE_PROJECT_ID: 'demo-placementstats', VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-placementstats.firebaseapp.com', VITE_FIREBASE_APP_ID: '1:123456789:web:demo',
});
