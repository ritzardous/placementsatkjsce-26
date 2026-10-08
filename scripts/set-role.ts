import { getAuth } from 'firebase-admin/auth';
import { createAdminTarget, safeMigrationError } from './firebase-admin.js';

let target: ReturnType<typeof createAdminTarget> | undefined;
try {
  const args = process.argv.slice(2);
  const uid = args[args.indexOf('--uid') + 1];
  const role = args[args.indexOf('--role') + 1];
  if (!args.includes('--uid') || !uid || !['contributor', 'moderator', 'admin'].includes(role)) throw new Error('Supply --uid FIREBASE_AUTH_UID --role contributor|moderator|admin.');
  target = createAdminTarget();
  const auth = getAuth(target.app);
  const user = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { ...user.customClaims, role });
  console.log('Role claim updated. The user must sign out/in to refresh their token. This release still denies all browser publication writes.');
} catch (error) { console.error(safeMigrationError(error)); process.exitCode = 1; }
finally { await target?.close(); }
