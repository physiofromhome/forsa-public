// Central config. The bridge URL is injected via Vite env at build time.
// Set VITE_BRIDGE_URL in the Vercel project settings (and a local .env for dev).
const RAW_BRIDGE =
  import.meta.env.VITE_BRIDGE_URL || "https://your-bridge.up.railway.app";

// Normalise: strip trailing slashes (a trailing "/" turns POST /auth/login into
// a redirect, which downgrades it to GET and causes a 405), and ensure scheme.
function normaliseBridge(u) {
  let s = (u || "").trim().replace(/\/+$/, "");
  if (s && !/^https?:\/\//i.test(s)) s = "https://" + s;
  return s;
}

export const BRIDGE_URL = normaliseBridge(RAW_BRIDGE);

export const APP_NAME = "Forsa";

// Storage keys (localStorage). Kept distinct from the admin app's keys so the
// two apps never collide if a user opens both on the same device.
export const STORAGE = {
  token: "forsa_pub_token",
  refresh: "forsa_pub_refresh",
  email: "forsa_pub_email",
};
