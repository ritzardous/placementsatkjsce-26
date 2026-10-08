import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const action = process.env.FIREBASE_ACTION;
const projectId = process.env.FIREBASE_PROJECT_ID;
const year = process.env.FIREBASE_BATCH_YEAR ?? '2026';
if (!['2025', '2026', '2027'].includes(year)) throw new Error('Choose a supported graduation year.');
if (!['publish', 'verify', 'rules', 'set-role'].includes(action)) throw new Error('Choose publish, verify, rules, or set-role in the Firebase cloud workflow.');
if (!projectId || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId) || projectId.startsWith('demo-')) throw new Error('Configure a real FIREBASE_PROJECT_ID in the protected GitHub environment.');
if (!process.env.GITHUB_ACTIONS) throw new Error('This command is intended for the manually dispatched GitHub Actions workflow.');
let credential;
try { credential = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? ''); }
catch { throw new Error('Configure FIREBASE_SERVICE_ACCOUNT_JSON as a GitHub environment secret.'); }
if (credential.project_id !== projectId || !credential.private_key || !credential.client_email) throw new Error('The protected credential must belong to the selected Firebase project.');
// Persist only inside the ephemeral runner, never the repository or frontend build.
const directory = await mkdtemp(join(process.env.RUNNER_TEMP ?? tmpdir(), 'placementstats-'));
const credentialFile = join(directory, 'service-account.json');
await writeFile(credentialFile, JSON.stringify(credential), { mode: 0o600 });
const env = { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: credentialFile };
delete env.FIREBASE_SERVICE_ACCOUNT_JSON;
delete env.FIRESTORE_EMULATOR_HOST;
delete env.FIREBASE_AUTH_EMULATOR_HOST;
async function run(args) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit', env });
    child.on('error', reject); child.on('exit', code => resolve(code));
  });
  if (code !== 0) throw new Error('Firebase cloud operation failed; check the safe job output above.');
}
const target = ['--project', projectId, '--allow-production'];
try {
  if (action === 'publish') {
    await run(['node_modules/tsx/dist/cli.mjs', 'scripts/seed-firestore.ts', '--year', year, '--dry-run']);
    await run(['node_modules/tsx/dist/cli.mjs', 'scripts/deploy-rules.ts', ...target]);
    await run(['node_modules/tsx/dist/cli.mjs', 'scripts/seed-firestore.ts', '--year', year, ...target]);
    await run(['node_modules/tsx/dist/cli.mjs', 'scripts/verify-firestore.ts', '--year', year, ...target]);
  } else if (action === 'rules') await run(['node_modules/tsx/dist/cli.mjs', 'scripts/deploy-rules.ts', ...target]);
  else if (action === 'verify') await run(['node_modules/tsx/dist/cli.mjs', 'scripts/verify-firestore.ts', '--year', year, ...target]);
  else {
    const uid = process.env.FIREBASE_AUTH_UID;
    const role = process.env.FIREBASE_AUTH_ROLE;
    if (!uid || !['contributor', 'moderator', 'admin'].includes(role)) throw new Error('Set a valid account UID and role in the manual workflow inputs.');
    await run(['node_modules/tsx/dist/cli.mjs', 'scripts/set-role.ts', ...target, '--uid', uid, '--role', role]);
  }
} finally {
  // Delete exactly the two temporary paths created above, without recursive deletion.
  await rm(credentialFile, { force: true });
  await rmdir(directory);
}
