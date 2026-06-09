// ─────────────────────────────────────────────────────────────────────────
// API client for the Forsa public app.
// Talks to the SAME Railway bridge as the admin app, using the shared auth
// endpoints (/auth/*) and the public data endpoints (/public/*) we added.
// It never calls any trade-idea / scorecard / verdict endpoint.
// ─────────────────────────────────────────────────────────────────────────
import { BRIDGE_URL, STORAGE } from "./config";

function getToken() {
  return localStorage.getItem(STORAGE.token) || "";
}
function getRefresh() {
  return localStorage.getItem(STORAGE.refresh) || "";
}
function setSession({ token, refresh_token, email }) {
  if (token) localStorage.setItem(STORAGE.token, token);
  if (refresh_token) localStorage.setItem(STORAGE.refresh, refresh_token);
  if (email) localStorage.setItem(STORAGE.email, email);
}
export function clearSession() {
  localStorage.removeItem(STORAGE.token);
  localStorage.removeItem(STORAGE.refresh);
  localStorage.removeItem(STORAGE.email);
}
export function currentEmail() {
  return localStorage.getItem(STORAGE.email) || "";
}
export function isLoggedIn() {
  return !!getToken();
}

async function raw(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  const res = await fetch(`${BRIDGE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

// Attempt a token refresh using the durable refresh token.
async function tryRefresh() {
  const refresh_token = getRefresh();
  if (!refresh_token) return false;
  try {
    const res = await raw("/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refresh_token },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) {
      setSession(data);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

// Core request with one transparent refresh-and-retry on 401.
async function request(path, opts = {}) {
  let res = await raw(path, opts);
  if (res.status === 401 && opts.auth !== false) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await raw(path, opts);
    } else {
      clearSession();
      throw new ApiError("Session expired", 401);
    }
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const e = await res.json();
      msg = e.error || msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(msg, res.status);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const auth = {
  async register(email, password) {
    const data = await request("/auth/register", {
      method: "POST",
      auth: false,
      body: { email: email.trim().toLowerCase(), password },
    });
    setSession(data);
    return data;
  },
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      auth: false,
      body: { email: email.trim().toLowerCase(), password },
    });
    setSession(data);
    return data;
  },
  logout() {
    clearSession();
  },
};

// ── Public data (FCA-safe) ──────────────────────────────────────────────────
export const data = {
  coins() {
    return request("/public/coins");
  },
  signals(sym, history = 60) {
    return request(`/public/signals/${sym}?history=${history}`);
  },
  global(history = 90) {
    return request(`/public/global?history=${history}`);
  },
  patternMatch(sym, { minMatch = 4, horizon = 14, lookback = 365 } = {}) {
    return request(
      `/public/pattern-match/${sym}?min_match=${minMatch}&horizon=${horizon}&lookback=${lookback}`
    );
  },
  patternNarrative(sym, { minMatch = 4, horizon = 14 } = {}) {
    return request(
      `/public/pattern-narrative/${sym}?min_match=${minMatch}&horizon=${horizon}`
    );
  },
  // Reused, already-existing bridge endpoints that are genuinely neutral:
  news() {
    return request("/news");
  },
  fearGreedHistory() {
    return request("/market/fear-greed-history");
  },
};

// ── Community (user-generated; platform, not adviser) ────────────────────────
export const community = {
  rooms() {
    return request("/community/rooms");
  },
  room(coin, limit = 30) {
    return request(`/community/room/${coin}?limit=${limit}`);
  },
  feed(limit = 40) {
    return request(`/community/feed?limit=${limit}`);
  },
  post(coin, body) {
    return request("/community/post", { method: "POST", body: { coin, body } });
  },
  deletePost(id) {
    return request(`/community/post/${id}`, { method: "DELETE" });
  },
  like(id) {
    return request(`/community/post/${id}/like`, { method: "POST" });
  },
  comments(id) {
    return request(`/community/post/${id}/comments`);
  },
  addComment(id, body) {
    return request(`/community/post/${id}/comment`, { method: "POST", body: { body } });
  },
  getProfile(email) {
    return request(`/community/profile${email ? `?email=${encodeURIComponent(email)}` : ""}`);
  },
  setProfile(profile) {
    return request("/community/profile", { method: "POST", body: profile });
  },
};
