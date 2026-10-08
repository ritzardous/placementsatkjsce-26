import { useEffect } from 'react';
import Dashboard, { initAnalytics } from './Dashboard';
import { AuthProvider, useAuth } from './auth';
import { Home, Landing, Login, Procedures, Upcoming, PortalShell } from './Portal';
import { useRoute } from './routing';

function Application() {
  const route = useRoute();
  const auth = useAuth();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => {
    if (auth.ready && auth.allowed && ['login', 'landing'].includes(route.page)) location.replace('#home');
  }, [auth.ready, auth.allowed, route.page]);
  useEffect(() => {
    if (['landing','login','home','statistics','procedures','alumni','contributions'].includes(route.page)) document.title = 'Placement Stats KJSCE';
  }, [route.page]);
  if (!auth.ready) return <div className="session-loading" role="status">Getting your session ready…</div>;
  if (!auth.allowed) return route.page === 'landing' ? <Landing /> : <Login deepLink={route.page !== 'login'} />;
  if (route.page === 'home' || route.page === 'landing' || route.page === 'login') return <Home />;
  if (route.page === 'statistics') return <Home statisticsOnly />;
  if (route.page === 'procedures') return <Procedures contribute={route.parameter === 'contribute'} />;
  if (route.page === 'alumni' || route.page === 'contributions') return <Upcoming contributions={route.page === 'contributions'} />;
  if (['overview','companies','company','branches','candidates','timeline','insights'].includes(route.page)) return <Dashboard route={route} />;
  return <PortalShell active="home"><section className="portal-welcome"><h1>Page not found</h1><p>Choose a placement year or another section from Home.</p><a className="portal-link" href="#home">Back to Home ↗</a></section></PortalShell>;
}
export default function App() { return <AuthProvider><Application /></AuthProvider>; }
