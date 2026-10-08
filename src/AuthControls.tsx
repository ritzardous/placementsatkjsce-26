import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth';
export default function AuthControls() {
  const { user, busy, error, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [open]);
  return <div className="auth-controls">
    <button className="auth-button" onClick={() => setOpen(true)}>Account</button>
    <dialog ref={dialog} onClose={() => setOpen(false)} aria-labelledby="auth-title" className="auth-dialog">
      <button className="dialog-close" aria-label="Close account dialog" onClick={() => setOpen(false)}>×</button>
      <h2 id="auth-title">Your account</h2>
      <p>Signed in as <strong>{user?.displayName ?? user?.email ?? 'Student'}</strong>.</p>
      <p>{user?.email}</p><p>You’re using Google to access Placement Stats KJSCE. Signing in does not verify alumni status or company selection.</p>
      <button className="action-button" disabled={busy} onClick={() => void logout()}>{busy ? 'Signing out…' : 'Sign out'}</button>
      {error && <p className="auth-message" role="alert">{error}</p>}
    </dialog>
  </div>;
}
