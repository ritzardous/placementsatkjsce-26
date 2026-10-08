import 'dotenv/config';
import { applicationDefault, initializeApp, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

export function createAdminTarget(args = process.argv.slice(2)) {
  const emulator = args.includes('--emulator');
  const projectAt = args.indexOf('--project');
  const projectId = projectAt >= 0 ? args[projectAt + 1] : emulator ? 'demo-placementstats' : undefined;
  if (!projectId || projectId.startsWith('--')) throw new Error('Specify --emulator or --project YOUR_PROJECT_ID --allow-production.');
  if (emulator) {
    if (!projectId.startsWith('demo-')) throw new Error('Emulator operations require a demo- project ID.');
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  } else {
    if (!args.includes('--allow-production') || projectId.startsWith('demo-')) throw new Error('Live Firebase operations require an explicit real --project and --allow-production.');
    if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Unset emulator environment variables before accessing a live project.');
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credential = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      if (credential.project_id && credential.project_id !== projectId) throw new Error('The service-account credential belongs to a different Firebase project.');
    }
  }
  const app = initializeApp({ projectId, ...(emulator ? {} : { credential: applicationDefault() }) }, 'migration');
  const db = getFirestore(app);
  console.log(`Target: ${emulator ? 'LOCAL EMULATOR' : 'LIVE FIREBASE PROJECT'} ${projectId}`);
  return { app, db, projectId, emulator, close: () => deleteApp(app) };
}
export function safeMigrationError(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === '7' || code.includes('permission-denied') || code.includes('permission_denied') || error instanceof Error && error.message === 'The caller does not have permission') return 'Firebase denied the service account access. Check Cloud Datastore User (data) and Firebase Rules Admin (rules) IAM roles; see 4amchanges.md.';
  // SDK errors may include credential paths or service-account data; never echo them.
  if (error instanceof Error && error.name === 'Error' && !('code' in error)) return error.message;
  return 'Firebase operation failed. Check emulator availability or your project ID, Firestore setup, and Admin credentials; see 4amchanges.md.';
}
