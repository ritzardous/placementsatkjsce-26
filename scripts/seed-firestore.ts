import { createAdminTarget, safeMigrationError } from './firebase-admin.js';
import { activatePublication, preparePublication, stagePublication, verifyPublication } from './publication.js';

let target: ReturnType<typeof createAdminTarget> | undefined;
try {
  const at = process.argv.indexOf('--year');
  const p = await preparePublication(at < 0 ? 2026 : Number(process.argv[at + 1]));
  console.log(`Validated ${p.batch.year} fixture:`, p.dashboard.statistics.summary);
  console.log(`Public dashboard: ${p.chunks.length} chunks, ${Buffer.byteLength(p.payload)} bytes.`);
  if (process.argv.includes('--dry-run')) console.log('Dry run passed; no database connection or writes.');
  else {
    target = createAdminTarget();
    await stagePublication(target.db, p);
    await activatePublication(target.db, p);
    await verifyPublication(target.db, p);
    console.log('Firestore migration published and reconciled. Re-running is safe and does not overwrite changed data.');
  }
} catch (error) { console.error(safeMigrationError(error)); process.exitCode = 1; }
finally { await target?.close(); }
