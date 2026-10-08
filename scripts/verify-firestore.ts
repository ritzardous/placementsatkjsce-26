import { createAdminTarget, safeMigrationError } from './firebase-admin.js';
import { preparePublication, verifyPublication } from './publication.js';

let target: ReturnType<typeof createAdminTarget> | undefined;
try {
  const at = process.argv.indexOf('--year');
  const p = await preparePublication(at < 0 ? 2026 : Number(process.argv[at + 1]));
  target = createAdminTarget();
  await verifyPublication(target.db, p);
  console.log('Verified: all Firestore source records, metadata, published chunks, metrics, and active version match the legacy fixture.');
} catch (error) { console.error(safeMigrationError(error)); process.exitCode = 1; }
finally { await target?.close(); }
