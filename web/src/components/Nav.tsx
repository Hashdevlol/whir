import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogoMark, Wordmark } from './Logo';
import { useAuth } from '../lib/auth';

export const NAV_LINKS = [
  { to: '/chat', label: 'Chat' },
  { to: '/create', label: 'Create' },
  { to: '/docs', label: 'API' },
  { to: '/earn', label: 'Earn' },
  { to: '/pricing', label: 'Pricing' },
];

export function AccountButton({ compact = false }: { compact?: boolean }) {
  const { me, signedIn, openSignIn, loading } = useAuth();
  if (loading) return <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4 }}>…</span>;
  if (!signedIn) {
    return (
      <button className={`btn ${compact ? 'btn-quiet' : 'btn-ink'} btn-sm`} onClick={() => openSignIn()}>
        Sign in
      </button>
    );
  }
  return (
    <Link to="/settings#account" className="acct-chip" title="Account settings">
      <span className="avatar">{(me!.user.name ?? 'A').slice(0, 1).toUpperCase()}</span>
      <span className="name">{me!.user.name ?? 'Account'}</span>
    </Link>
  );
}

export function Nav({ full = false }: { full?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const home = loc.pathname === '/';
  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <>
      <nav className={`nav${full ? ' full' : ''}${scrolled || !home ? ' scrolled' : ''}${open ? ' open' : ''}`}>
        <div className="wrap">
          <Link className="brand" to="/" aria-label="Whir home">
            <Wordmark size={20} />
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>{l.label}</NavLink>
            ))}
          </div>
          <div className="nav-actions">
            <AccountButton compact />
            {home && <Link to="/chat" className="btn btn-ink btn-sm hide-sm">Get started</Link>}
            <button className="menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
              <span />
            </button>
          </div>
        </div>
      </nav>
      {open && (
        <div className="mobile-menu">
          {NAV_LINKS.map((l, i) => (
            <NavLink key={l.to} to={l.to} style={{ animationDelay: `${i * 35}ms` }} className={({ isActive }) => (isActive ? 'active' : '')}>{l.label}</NavLink>
          ))}
          <NavLink to="/settings" style={{ animationDelay: `${NAV_LINKS.length * 35}ms` }}>Settings</NavLink>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link className="brand" to="/" aria-label="Whir home"><Wordmark size={20} /></Link>
            <p className="footer-blurb">AI served by everyday computers. Open models, priced per token. Nothing you type is stored.</p>
          </div>
          <div><h2>Use</h2><ul><li><Link to="/chat">Chat</Link></li><li><Link to="/create">Create</Link></li><li><Link to="/pricing">Pricing</Link></li><li><Link to="/docs">API</Link></li></ul></div>
          <div><h2>Earn</h2><ul><li><Link to="/earn">Run a node</Link></li><li><Link to="/docs#nodes">Node docs</Link></li><li><Link to="/settings#account">Referrals</Link></li></ul></div>
          <div><h2>Network</h2><ul><li><Link to="/network">Live status</Link></li><li><Link to="/network#swarms">Swarms</Link></li><li><Link to="/network#economics">Payouts</Link></li></ul></div>
          <div><h2>Help</h2><ul><li><Link to="/pricing#faq">FAQ</Link></li><li><Link to="/settings#keys">API keys</Link></li><li><Link to="/settings">Settings</Link></li></ul></div>
        </div>
        <div className="fine">
          <span className="row" style={{ gap: 8 }}><LogoMark size={14} /> © 2026 Whir</span>
          <span>70% of every paid token goes to the computer that served it.</span>
        </div>
      </div>
    </footer>
  );
}
