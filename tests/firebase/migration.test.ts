import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAdminTarget } from '../../scripts/firebase-admin.js';
import { activatePublication, preparePublication, stagePublication, verifyPublication } from '../../scripts/publication.js';

test('Firestore migration is idempotent and reconciles every original field', async () => {
  const target = createAdminTarget(['--emulator']);
  try {
    const p = await preparePublication();
    await stagePublication(target.db, p);
    await activatePublication(target.db, p);
    await stagePublication(target.db, p);
    await verifyPublication(target.db, p);
    assert.equal((await target.db.collection(`imports/2026-${p.version}/announcements`).get()).size, 100);
  } finally { await target.close(); }
});
test('changed source documents are rejected instead of overwritten', async () => {
  const target = createAdminTarget(['--emulator']);
  const p = await preparePublication();
  const ref = target.db.doc(`imports/2026-${p.version}/announcements/PL001`);
  const original = (await ref.get()).data()!;
  try {
    await ref.set({ record: { ...original.record, notes: 'Deliberate test corruption' } });
    await assert.rejects(stagePublication(target.db, p), /Existing document differs/);
  } finally { await ref.set(original); await target.close(); }
});
test('live targets require explicit project and production opt-in', () => {
  assert.throws(() => createAdminTarget([]), /Specify/);
  assert.throws(() => createAdminTarget(['--project', 'real-project']), /allow-production/);
  assert.throws(() => createAdminTarget(['--emulator', '--project', 'real-project']), /demo-/);
});

test('2025 publishes beside 2026 without changing its active snapshot', async () => {
  const target = createAdminTarget(['--emulator']);
  try {
    const before = (await target.db.doc('batches/2026').get()).data();
    const p = await preparePublication(2025);
    await stagePublication(target.db, p); await activatePublication(target.db, p); await verifyPublication(target.db, p);
    await stagePublication(target.db, p); await activatePublication(target.db, p);
    assert.deepEqual((await target.db.doc('batches/2026').get()).data(), before);
    assert.equal((await target.db.doc('batches/2025').get()).data()?.activeVersion, p.version);
  } finally { await target.close(); }
});
