import { useEffect, useState, type ReactNode } from 'react';
import AuthControls from './AuthControls';
import { GoogleButton, useAuth } from './auth';
import { CompanyIdentity } from './CompanyIdentity';
import { academicYear, routeHref } from './components';
import { loadDashboard } from './repository';
import { firebaseMessage } from './firebase';
import { years } from './routing';

const areas = [['statistics', 'Placement Stats'], ['procedures', 'Company Procedures']];
export function AreaNav({ active }: { active: string }) {
  return <nav className="area-nav" aria-label="App">{areas.map(([key, label]) => <a key={key} href={`#${key}`} aria-current={active === key || (active === 'home' && key === 'statistics') ? 'page' : undefined}>{label}</a>)}</nav>;
}
function Brand() { return <a className="brand" href="#home"><span className="brand-mark">KJSCE</span><span className="brand-name">Placement Stats</span></a>; }
function PortalFooter() { return <footer className="portal-footer"><span>Built by students. Grounded in sources.</span><span>Made with ♥ by Ritzardous</span></footer>; }
export function PortalShell({ active, children }: { active: string; children: ReactNode }) {
  return <div className="portal-shell"><a className="skip-link" href="#portal-main" onClick={event => { event.preventDefault(); document.getElementById('portal-main')?.focus(); }}>Skip to content</a><header className="portal-header"><div className="portal-header-inner"><Brand /><AuthControls /></div><AreaNav active={active} /></header><main className="portal-main" id="portal-main" tabIndex={-1}>{children}</main><PortalFooter /></div>;
}
export function Landing() {
  const { error } = useAuth();
  return <div className="landing"><header className="landing-header"><a className="brand" href="#landing"><span className="brand-mark">KJSCE</span><span className="brand-name">Placement Stats</span></a><a className="landing-login" href="#login">Sign in ↗</a></header><main className="landing-main">
    <section className="landing-hero"><div className="hero-copy"><span className="eyebrow">FOR KJSCE. BY YOUR PEERS.</span><h1>Your placement prep,<br />with <span>the facts.</span></h1><p>Explore placement stats by batch and company procedures across batches. Find selected candidates within each company’s stats page, with alumni contacts coming there next.</p><GoogleButton /><p className="access-note">Free access with your Google account.</p>{error && <p className="auth-message" role="alert">{error}</p>}</div>
      <div className="landing-preview" aria-label="Available placement batches"><div className="preview-label"><span>THE PLACEMENT ARCHIVE</span><span className="live-badge">2027 · LIVE</span></div><h2>Every batch.<br />Its own story.</h2>{years.map(year => <div className="preview-year" key={year}><strong>{academicYear(year)}</strong><span>Class of {year}</span><span>{year === 2027 ? 'Ongoing' : 'Historical'}</span></div>)}<div className="preview-companies">{[['google','Google'],['jpmc','JPMorganChase'],['ibm-india','IBM India'],['barclays','Barclays']].map(([key,name]) => <CompanyIdentity key={key} companyKey={key} name={name} size="small" />)}</div><p>Source-backed records. Visible gaps. No made-up numbers.</p></div>
    </section>
    <section className="landing-pillars" aria-labelledby="pillars-title"><div className="portal-section-heading"><span className="eyebrow">KNOW MORE. PREPARE BETTER.</span><h2 id="pillars-title">Numbers are the starting point.</h2></div><div className="pillar-grid"><article><span className="pillar-number">01 / AVAILABLE NOW</span><h3>See the full picture.</h3><p>Explore companies, packages, branches, roles and hiring timelines across three batches. Sources and missing information stay visible. Selected candidates and future alumni contacts belong to each company’s stats page.</p></article><article><span className="pillar-number">02 / COMING SOON</span><h3>Understand the rounds.</h3><p>Firsthand test and interview experiences, reviewed before publication. A separate company archive that grows with each batch.</p></article></div></section>
    <section className="landing-trust"><div><span className="eyebrow">CLARITY OVER HYPE</span><h2>Know where every claim comes from.</h2><p>Statistics use college reports and placement emails. Unknown details stay unknown. Future experience reviews will cover what was verified, without promising that the next drive follows the same process.</p></div><a className="portal-link" href="#login">Explore with Google ↗</a></section>
    <details className="landing-privacy"><summary>Privacy & contribution principles</summary><p>Google sign-in uses your account identity to manage access. Signing in does not publish your profile or prove alumni status. No LinkedIn contacts or recruitment experiences are published in this release. Future contributions will offer clear attribution choices and keep verification evidence private for admin review.</p></details>
  </main><PortalFooter /></div>;
}
export function Login({ deepLink = false }: { deepLink?: boolean }) {
  const { error, user, logout, busy } = useAuth();
  return <div className="login-page"><header className="landing-header"><a className="brand" href="#landing"><span className="brand-mark">KJSCE</span><span className="brand-name">Placement Stats</span></a><a href="#landing">← Back to landing</a></header><main className="login-main"><div className="login-card"><span className="eyebrow">YOUR PLACEMENT ARCHIVE</span><h1>Good to see you.</h1><p>Sign in with Google to explore the placement years and the community sections.</p>{deepLink && <p className="login-return">We’ll take you back to the page you opened after sign-in.</p>}{user && <p className="login-return">Your current session needs Google sign-in to continue. Use the same Google email to retain your existing account where supported.</p>}<GoogleButton />{user && <button className="text-button" disabled={busy} onClick={() => void logout()}>Sign out of the current account</button>}{error && <p className="auth-message" role="alert">{error}</p>}<p className="access-note">Your Google account is used for access. It does not verify alumni status, and your profile is not published.</p></div></main><PortalFooter /></div>;
}
export function YearChoices() {
  return <section aria-labelledby="years-title"><div className="portal-section-heading"><span className="eyebrow">PLACEMENT STATISTICS</span><h2 id="years-title">Choose your batch.</h2><p>Each year has its own companies, outcomes and source notes.</p></div><div className="year-grid">{years.map(year => <a className={`year-card ${year === 2027 ? 'year-card-live' : ''}`} key={year} href={routeHref('overview',year)}><div className="year-card-top"><span>{academicYear(year)}</span>{year === 2027 ? <span className="live-badge">LIVE</span> : <span className="year-status">HISTORICAL</span>}</div><h3>Class of {year}</h3><p>{year === 2027 ? 'Placements ongoing. Provisional results, updated from reviewed placement emails.' : year === 2025 ? 'College UG report and placement emails. Missing facts remain visible.' : 'Company-wise placement announcements, selections and hiring timelines.'}</p><span className="year-card-link">View statistics <span aria-hidden="true">↗</span></span></a>)}</div></section>;
}
export function Home({ statisticsOnly = false }: { statisticsOnly?: boolean }) {
  const { user } = useAuth();
  return <PortalShell active={statisticsOnly ? 'statistics' : 'home'}><section className="portal-welcome"><span className="eyebrow">YOUR NEXT STEP STARTS HERE</span><h1>{statisticsOnly ? 'Placement Stats' : `Welcome${user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.`}</h1><p>{statisticsOnly ? 'Explore one placement season at a time.' : 'Explore placement stats by batch, or company procedures for recruitment experiences.'}</p></section><YearChoices />{!statisticsOnly && <section className="community-entry"><div><span className="eyebrow">BEYOND THE NUMBERS</span><h2>Company Procedures</h2><p>A separate archive across batches. Browse approved recruitment experiences, or help build the archive for companies that visited campus.</p><span className="coming-label">Experiences & submissions coming soon</span></div><a className="portal-link" href="#procedures">Explore the directory ↗</a></section>}</PortalShell>;
}
type DirectoryCompany = { key: string; name: string; years: number[] };
export function Procedures({ contribute }: { contribute: boolean }) {
  const [companies, setCompanies] = useState<DirectoryCompany[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!contribute) return;
    let active = true; setLoading(true); setError('');
    void Promise.all(years.map(year => loadDashboard(year))).then(dashboards => {
      const directory = new Map<string, DirectoryCompany>();
      for (const dashboard of dashboards) for (const company of dashboard.statistics.companies) {
        // Only include sourced campus recruiters; do not merge firms by shared logos.
        if (!dashboard.statistics.candidates.some(candidate => candidate.companyKey === company.key && candidate.campus !== 'Off campus')) continue;
        const key = company.key.replaceAll('_', '-');
        const existing = directory.get(key) ?? { key, name: company.name, years: [] };
        const year = dashboard.statistics.batch.year;
        if (!existing.years.includes(year)) existing.years.push(year);
        directory.set(key, existing);
      }
      if (active) setCompanies([...directory.values()].sort((a,b) => a.name.localeCompare(b.name)));
    }).catch(cause => { if (active) setError(firebaseMessage(cause)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [contribute, attempt]);
  const filtered = companies.filter(company => company.name.toLowerCase().includes(search.toLowerCase()));
  return <PortalShell active="procedures"><section className="portal-welcome"><span className="eyebrow">THE COMMUNITY ARCHIVE</span><h1>Company Procedures</h1><p>Separate from the year-wise statistics. Built around companies and firsthand recruitment experiences.</p></section><nav className="procedure-tabs" aria-label="Company procedures views"><a href="#procedures" aria-current={!contribute ? 'page' : undefined}>Browse</a><a href="#procedures/contribute" aria-current={contribute ? 'page' : undefined}>Contribute</a></nav>{!contribute ? <section className="portal-empty"><span className="coming-label">COMING SOON</span><h2>The first experiences are yet to be published.</h2><p>Only companies with admin-approved recruitment information will appear here. Until then, explore the recruiter directory and see where you’ll be able to contribute.</p><a className="portal-link" href="#procedures/contribute">View campus recruiters ↗</a></section> : <section><div className="contribute-notice"><strong>Help build what you wish you’d had.</strong><p>Browse sourced campus recruiters across all three batches. Submission forms and admin review are coming next; no experience is accepted or published yet. Future contributions will require admin approval before students can read them.</p></div><label className="directory-search">Find a company<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campus recruiters…" /></label>{loading ? <p role="status">Loading the campus recruiter directory…</p> : error ? <div role="alert"><p>{error}</p><button className="action-button" onClick={() => setAttempt(n=>n+1)}>Try again</button></div> : <><p className="directory-count">{filtered.length} / {companies.length} source-backed campus recruiter entries</p><div className="recruiter-grid">{filtered.map(company => <article className="recruiter-card" key={company.key}><CompanyIdentity companyKey={company.key} name={company.name} /><p>{company.years.sort().map(year=>`Class of ${year}`).join(' · ')}</p><span className="coming-label">Contributions opening soon</span></article>)}</div>{!filtered.length && <p>No matching campus recruiters.</p>}</>}</section>}</PortalShell>;
}
export function Account() {
  const { user, busy, error, logout } = useAuth();
  const accountDate = (value: string | undefined) => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not available';
  return <PortalShell active="account"><section className="portal-welcome"><span className="eyebrow">YOUR PERSONAL SPACE</span><h1>My Account</h1><p>Your account information and contributions, all in one place.</p></section>
    <section className="account-details" aria-labelledby="account-details-title"><h2 id="account-details-title">Account information</h2><dl className="account-fields"><div><dt>Name</dt><dd>{user?.displayName || 'Not provided'}</dd></div><div><dt>Email</dt><dd>{user?.email || 'Not provided'}</dd></div><div><dt>Sign-in method</dt><dd>Google</dd></div><div><dt>Account created</dt><dd>{accountDate(user?.metadata.creationTime)}</dd></div><div><dt>Last sign-in</dt><dd>{accountDate(user?.metadata.lastSignInTime)}</dd></div></dl><button className="action-button" disabled={busy} onClick={() => void logout()}>{busy ? 'Signing out...' : 'Sign out'}</button>{error && <p className="auth-message" role="alert">{error}</p>}</section>
    <section className="portal-empty account-contributions" aria-labelledby="contributions-title"><span className="coming-label">COMING SOON</span><h2 id="contributions-title">My Contributions</h2><p>Your drafts, submitted recruitment experiences, review status and admin feedback will appear here once contributions open.</p><a className="portal-link" href="#procedures/contribute">Explore company procedures</a></section>
  </PortalShell>;
}
