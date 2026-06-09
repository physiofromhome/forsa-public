import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const isRegister = mode === "register";

  async function submit() {
    setErr("");
    if (!email || !pw) { setErr("Enter your email and password."); return; }
    if (isRegister && pw.length < 8) { setErr("Use at least 8 characters."); return; }
    setBusy(true);
    try {
      if (isRegister) await register(email, pw);
      else await login(email, pw);
      nav("/dashboard");
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fade-in" style={{ maxWidth: 380, margin: "40px auto" }}>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 6 }}>
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
        {isRegister ? "Get access to live signals and historical context." : "Sign in to continue."}
      </p>

      <div className="card">
        <div className="field">
          <label>Email</label>
          <input
            type="email" value={email} autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password" value={pw}
            autoComplete={isRegister ? "new-password" : "current-password"}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={isRegister ? "At least 8 characters" : "Your password"}
          />
        </div>

        {err && <div style={{ color: "var(--ember)", fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <button className="btn btn-ember" style={{ width: "100%", padding: "11px" }} onClick={submit} disabled={busy}>
          {busy ? "…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </div>

      <p className="muted center" style={{ marginTop: 18, fontSize: 13 }}>
        {isRegister ? (
          <>Already have an account? <Link to="/login" style={{ color: "var(--ember)" }}>Sign in</Link></>
        ) : (
          <>New to Forsa? <Link to="/register" style={{ color: "var(--ember)" }}>Create an account</Link></>
        )}
      </p>
    </div>
  );
}
