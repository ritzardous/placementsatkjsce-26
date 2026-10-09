export default function AuthControls() {
  return <div className="auth-controls"><a className="auth-button" href="#account" aria-current={location.hash === '#account' ? 'page' : undefined}>My Account</a></div>;
}
