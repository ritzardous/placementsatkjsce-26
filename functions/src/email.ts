import type { Firestore } from 'firebase-admin/firestore';

export type EmailConfig = { recipients: string; sender: string; appUrl: string; apiKey: string };
export async function deliverEmail(db: Firestore, id: string, config: EmailConfig, send: typeof fetch = fetch) {
  if (!config.recipients || !config.sender || !config.appUrl) return;
  const ref = db.doc(`procedureEmailOutbox/${id}`), now = Date.now();
  const item = await db.runTransaction(async tx => {
    const snap = await tx.get(ref), data = snap.data();
    if (!data || data.status === 'sent' || data.status === 'failed' || data.attempts >= 5 || (data.nextAttemptAt ?? 0) > now || (data.leaseUntil ?? 0) > now) return null;
    tx.update(ref, { status: 'sending', attempts: data.attempts + 1, leaseUntil: now + 120_000 });
    return data;
  });
  if (!item) return;
  try {
    const response = await send('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(20_000),
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': id },
      body: JSON.stringify({ from: config.sender, to: config.recipients.split(',').map(s => s.trim()).filter(Boolean), subject: 'Company Procedures: a submission needs review', text: `A ${item.companyName} experience (revision ${item.revision}) is ready for review.\n\n${config.appUrl.replace(/\/$/, '')}/#admin/procedures\n\nSign in with your admin Google account to review it.` }),
    });
    if (!response.ok) throw new Error('Provider did not accept email');
    await ref.update({ status: 'sent', sentAt: Date.now(), leaseUntil: 0 });
  } catch {
    await ref.update({ status: item.attempts + 1 >= 5 ? 'failed' : 'pending', nextAttemptAt: Date.now() + 60_000 * 2 ** item.attempts, leaseUntil: 0, error: 'Email delivery failed. Check the provider and sender configuration.' });
  }
}
