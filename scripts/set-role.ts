import { getAuth } from 'firebase-admin/auth';
import { createAdminTarget, safeMigrationError } from './firebase-admin.js';

let target: ReturnType<typeof createAdminTarget> | undefined;
try {
  const args = process.argv.slice(2);
  const uid = args.includes('--uid') ? args[args.indexOf('--uid') + 1] : undefined;
  const email = args.includes('--email') ? args[args.indexOf('--email') + 1] : undefined;
  const role = args[args.indexOf('--role') + 1];
  if ((!uid && !email) || (uid && email) || !['contributor', 'moderator', 'admin', 'none'].includes(role)) throw new Error('Supply either --uid FIREBASE_AUTH_UID or --email GOOGLE_EMAIL, and --role contributor|moderator|admin|none.');
  target = createAdminTarget();
  const auth = getAuth(target.app);
  const user = email ? await auth.getUserByEmail(email) : await auth.getUser(uid!);
  if (role === 'admin' && (!user.emailVerified || !user.providerData.some(provider => provider.providerId === 'google.com') || user.disabled)) throw new Error('Admin access requires an active, verified Google account. Sign in with Google first.');
  const claims = { ...user.customClaims };
  if (role === 'none') delete claims.role; else claims.role = role;
  await auth.setCustomUserClaims(user.uid, claims);
  if (role === 'none') await auth.revokeRefreshTokens(user.uid);
  console.log('Role claim updated. Sign out/in to refresh the token. Community moderation requires the admin claim; publication data imports remain script-only.');
} catch (error) { console.error(safeMigrationError(error)); process.exitCode = 1; }
finally { await target?.close(); }
