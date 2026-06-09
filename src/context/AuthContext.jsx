import { createContext, useContext, useState, useCallback } from "react";
import { auth, currentEmail, isLoggedIn, clearSession } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(currentEmail());
  const [authed, setAuthed] = useState(isLoggedIn());

  const login = useCallback(async (e, p) => {
    const d = await auth.login(e, p);
    setEmail(d.email || e);
    setAuthed(true);
    return d;
  }, []);

  const register = useCallback(async (e, p) => {
    const d = await auth.register(e, p);
    setEmail(d.email || e);
    setAuthed(true);
    return d;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAuthed(false);
    setEmail("");
  }, []);

  return (
    <AuthCtx.Provider value={{ email, authed, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
