import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { authed, email, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const is = (p) => (loc.pathname === p ? "active" : "");

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            Forsa<span className="dot">.</span>
            <small>Market Intelligence</small>
          </Link>

          <nav className="nav">
            {authed ? (
              <>
                <Link className={is("/dashboard")} to="/dashboard">Dashboard</Link>
                <Link className={is("/markets")} to="/markets">Markets</Link>
                <Link className={is("/patterns")} to="/patterns">Patterns</Link>
                <Link className={is("/community")} to="/community">Community</Link>
                <Link className={is("/profile")} to="/profile">Profile</Link>
                <button
                  className="btn btn-ghost"
                  onClick={() => { logout(); nav("/"); }}
                  title={email}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className={is("/login")} to="/login">Sign in</Link>
                <Link to="/register"><span className="btn btn-ember">Get access</span></Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingTop: 28, paddingBottom: 28, width: "100%" }}>
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
            <span>Forsa — neutral market signal intelligence & historical context.</span>
            <span className="faint">
              Information only. Not financial advice. Past behaviour does not indicate future results.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
