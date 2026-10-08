import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { createAdminTarget, safeMigrationError } from './firebase-admin.js';

let target: ReturnType<typeof createAdminTarget> | undefined;
try {
  target = createAdminTarget();
  if (target.emulator) throw new Error('Use test:firebase for isolated rules tests.');
  const source = await readFile('firestore.rules', 'utf8');
  const rules = getSecurityRules(target.app);
  try {
    const previous = await rules.getFirestoreRuleset();
    await mkdir('artifacts/rules-backups', { recursive: true });
    await writeFile(`artifacts/rules-backups/${target.projectId}-${Date.now()}.json`, JSON.stringify(previous, null, 2));
  } catch (error) {
    if ((error as { code?: string }).code !== 'security-rules/not-found') throw error;
  }
  const released = await rules.releaseFirestoreRulesetFromSource(source);
  const active = await rules.getFirestoreRuleset();
  if (active.name !== released.name || !active.source.some(file => file.content === source)) throw new Error('The active Firestore rules do not match the released source.');
  console.log('Firestore rules published and verified. Previous rules, if present, were backed up in ignored artifacts/rules-backups.');
} catch (error) { console.error(safeMigrationError(error)); process.exitCode = 1; }
finally { await target?.close(); }
