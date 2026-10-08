import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { GoogleAuthProvider, onIdTokenChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { firebaseMessage, getFirebase } from './firebase';

type AuthState = { user: User | null; ready: boolean; allowed: boolean; busy: boolean; error: string; login: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const operation = useRef(false);
  useEffect(() => {
    let revision = 0;
    let disposed = false;
    try {
      const unsubscribe = onIdTokenChanged(getFirebase().auth, current => {
        const request = ++revision;
        setReady(false); setAllowed(false); setUser(current);
        void (async () => {
          try {
            const token = current ? await current.getIdTokenResult() : null;
            if (!disposed && request === revision) {
              setAllowed(token?.signInProvider === 'google.com' && token.claims.email_verified === true);
              setReady(true);
            }
          } catch (cause) { if (!disposed && request === revision) { setError(firebaseMessage(cause)); setReady(true); } }
        })();
      }, cause => { setError(firebaseMessage(cause)); setReady(true); });
      return () => { disposed = true; revision++; unsubscribe(); };
    } catch (cause) { setError(firebaseMessage(cause)); setReady(true); }
  }, []);
  async function act(action: () => Promise<unknown>) {
    if (operation.current) return;
    operation.current = true; setBusy(true); setError('');
    try { await action(); } catch (cause) { setError(firebaseMessage(cause)); }
    finally { operation.current = false; setBusy(false); }
  }
  const login = () => act(() => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(getFirebase().auth, provider);
  });
  const logout = () => act(async () => {
    await signOut(getFirebase().auth);
    location.hash = '#landing';
  });
  return <AuthContext.Provider value={{ user, ready, allowed, busy, error, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('Authentication must be used inside AuthProvider.');
  return auth;
}
export function GoogleButton() {
  const { login, busy, ready } = useAuth();
  return <button className="google-button" disabled={busy || !ready} onClick={() => void login()}><span className="google-letter" aria-hidden="true"><img src="/company-logos/google.png" width="20" height="20" alt="" /></span>{busy ? 'Signing in…' : 'Continue with Google'}<span aria-hidden="true">↗</span></button>;
}
