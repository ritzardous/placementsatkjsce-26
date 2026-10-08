import { useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from 'firebase/auth';
import { firebaseMessage, getFirebase } from './firebase';

export default function AuthControls() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [, refreshVerification] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebase().auth, current => { setUser(current); setReady(true); }, error => { setMessage(firebaseMessage(error)); setReady(true); });
    } catch (error) { setMessage(firebaseMessage(error)); setReady(true); }
  }, []);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [open]);
  async function act(operation: () => Promise<unknown>, success = '') {
    setBusy(true); setMessage('');
    try { await operation(); setMessage(success); }
    catch (error) { setMessage(firebaseMessage(error)); }
    finally { setBusy(false); setPassword(''); }
  }
  async function emailSignIn() {
    const auth = getFirebase().auth;
    if (register) {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(result.user);
    } else await signInWithEmailAndPassword(auth, email.trim(), password);
    setOpen(false);
  }
  return <div className="auth-controls">
    <button className="auth-button" disabled={!ready} onClick={() => { setMessage(''); setOpen(true); }}>{!ready ? 'Account…' : user ? 'Account' : 'Sign in'}</button>
    <dialog ref={dialog} onClose={() => { setOpen(false); setPassword(''); }} aria-labelledby="auth-title" className="auth-dialog">
      <button type="button" className="dialog-close" aria-label="Close account dialog" onClick={() => setOpen(false)}>×</button>
      <h2 id="auth-title">{user ? 'Your account' : register ? 'Create an account' : 'Sign in'}</h2>
      {user ? <>
        <p>Signed in as <strong>{user.displayName ?? user.email ?? 'Student'}</strong>.</p>
        <p>Statistics stay available without an account. Contributions will be added in a later release.</p>
        {!user.emailVerified && <><p className="auth-note">Please verify your email before future contribution features.</p><button disabled={busy} className="auth-button" onClick={() => void act(() => sendEmailVerification(user), 'Verification email sent. Check your inbox.')}>Send verification email</button><button disabled={busy} className="auth-button" onClick={() => void act(async () => { await user.reload(); setUser(getFirebase().auth.currentUser); refreshVerification(n => n + 1); }, 'Email verification status refreshed.')}>Refresh verification</button></>}
        <button className="action-button" disabled={busy} onClick={() => void act(async () => { await signOut(getFirebase().auth); setEmail(''); setOpen(false); }, '')}>Sign out</button>
      </> : <>
        <p>Browsing placement statistics does not require sign-in.</p>
        <button className="auth-button google-signin" disabled={busy} onClick={() => void act(async () => { await signInWithPopup(getFirebase().auth, new GoogleAuthProvider()); setOpen(false); })}>Continue with Google</button>
        <form onSubmit={e => { e.preventDefault(); void act(emailSignIn); }}>
          <label htmlFor="auth-email">Email</label><input id="auth-email" autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="auth-password">Password</label><input id="auth-password" autoComplete={register ? 'new-password' : 'current-password'} type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} />
          <button className="action-button" disabled={busy} type="submit">{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in with email'}</button>
        </form>
        <div className="auth-links"><button disabled={busy} className="text-button" onClick={() => { setRegister(v => !v); setMessage(''); }}>{register ? 'Already have an account? Sign in' : 'Create an account'}</button><button className="text-button" disabled={busy || !email.trim()} onClick={() => void act(() => sendPasswordResetEmail(getFirebase().auth, email.trim()), 'If this address has an account, check your inbox for a reset link.')}>Forgot password?</button></div>
      </>}
      {message && <p className="auth-message" role="status">{message}</p>}
    </dialog>
  </div>;
}
