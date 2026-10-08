import { doc, getDocFromServer } from 'firebase/firestore';
import { getFirebase } from './firebase';
import { chunkId, manifestSchema, parseDashboard, versionSchema } from '../shared/publication';
import type { DashboardResponse } from '../shared/statistics';

export async function loadDashboard(year: number): Promise<DashboardResponse> {
  const { db, auth } = getFirebase();
  const token = await auth.currentUser?.getIdTokenResult();
  if (token?.signInProvider !== 'google.com' || token.claims.email_verified !== true) throw new Error('Sign in with Google to access placement data.');
  const manifestDocument = await getDocFromServer(doc(db, 'batches', String(year)));
  if (!manifestDocument.exists()) throw new Error('No published data for this batch. Run the Firestore seed command in 4amchanges.md.');
  const manifest = manifestSchema.parse(manifestDocument.data());
  if (manifest.year !== year) throw new Error('Published batch does not match the requested graduation year.');
  const path = `batches/${year}/versions/${manifest.activeVersion}`;
  const versionDocument = await getDocFromServer(doc(db, path));
  if (!versionDocument.exists()) throw new Error('The published dataset version is incomplete. Run db:verify before publishing.');
  const version = versionSchema.parse(versionDocument.data());
  // Pin one version for the whole load; no function invocation or statistics recomputation.
  const chunks = await Promise.all(Array.from({ length: version.chunkCount }, (_, i) => getDocFromServer(doc(db, `${path}/views/${chunkId(i)}`))));
  const json = chunks.map(chunk => {
    if (!chunk.exists() || typeof chunk.data().payload !== 'string') throw new Error('A published data chunk is missing or invalid.');
    return chunk.data().payload as string;
  }).join('');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json));
  const hash = [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join('');
  if (hash !== version.payloadHash) throw new Error('Published data integrity check failed. Please ask the owner to run db:verify.');
  const dashboard = parseDashboard(JSON.parse(json));
  if (dashboard.statistics.batch.year !== year) throw new Error('Dashboard data belongs to a different batch.');
  return dashboard;
}
