import { spawn } from 'node:child_process';
import { writeFile, unlink } from 'node:fs/promises';

// Supply harmless emulator-only values without overwriting personal local files.
const created = [];
async function createIfMissing(path, body) {
  try { await writeFile(path, body, { flag: 'wx' }); created.push(path); }
  catch (cause) { if (cause.code !== 'EEXIST') throw cause; }
}
async function run(args) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, FUNCTIONS_DISCOVERY_TIMEOUT: '60', E2E_PORT: process.env.E2E_PORT ?? '5174' } });
    child.on('error', reject); child.on('exit', resolve);
  });
  if (result !== 0) throw new Error('Firebase beta verification failed.');
}
try {
  await createIfMissing('functions/.env.local', 'PROCEDURE_ADMIN_EMAILS=\nPROCEDURE_EMAIL_FROM=\nPROCEDURE_APP_URL=\n');
  await createIfMissing('functions/.secret.local', 'PROCEDURE_RESEND_API_KEY=emulator-only\n');
  await run(['functions/node_modules/typescript/bin/tsc', '-p', 'functions/tsconfig.json']);
  await run(['node_modules/firebase-tools/lib/bin/firebase.js', 'emulators:exec', '--config', 'firebase.test.json', '--only', 'auth,firestore,functions', '--project', 'demo-placementstats', 'node scripts/run-firebase-tests.mjs']);
} catch (cause) { console.error(cause.message); process.exitCode = 1; }
finally { for (const path of created) await unlink(path); }
