import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { procedureError, watchContributions } from './procedures-api';
import { statusLabels, type ProcedureSubmission } from '../shared/procedures';

export function Contributions() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProcedureSubmission[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [attempt, setAttempt] = useState(0);
  useEffect(() => { if (!user) return; setLoading(true); setError(''); return watchContributions(user.uid, rows => { setRows(rows); setError(''); setLoading(false); }, cause => { setError(procedureError(cause)); setLoading(false); }); }, [user, attempt]);
  return <section className="account-contributions" aria-labelledby="contributions-title"><div className="procedure-heading"><h2 id="contributions-title">My Contributions</h2><a className="portal-link" href="#procedures/contribute">Share an experience ↗</a></div>{loading && <p role="status">Loading your contributions…</p>}{error && <p role="alert">{error} <button onClick={() => setAttempt(n => n + 1)}>Retry</button></p>}{!loading && !error && !rows.length && <p>Your first experience could help someone prepare. Drafts and review feedback will appear here.</p>}<div className="procedure-list">{rows.map(row => <article className="procedure-card" key={row.id}><div className="procedure-heading"><h3>{row.companyName || row.draft.companyKey || 'New experience'}</h3><span className={`procedure-badge status-${row.status}`}>{statusLabels[row.status]}</span></div><p>{row.draft.appearanceYear} · {row.draft.coverage} procedure · {row.draft.outcome}</p>{row.feedback && <p className="procedure-feedback"><strong>Admin feedback:</strong> {row.feedback}</p>}<div className="procedure-actions"><a href={`#procedures/contribute?draft=${row.id}`}>{row.status === 'pending' ? 'View submission' : 'Continue / revise'} ↗</a>{row.hasPublished && <a href={`#procedures/${row.id}`}>Read approved version ↗</a>}</div></article>)}</div>{rows.length === 100 && <p>Your latest 100 contributions are shown.</p>}</section>;
}
