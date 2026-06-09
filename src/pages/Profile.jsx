import { useEffect, useState } from "react";
import { community } from "../lib/api";
import { Spinner } from "../components/ui";

const STYLES = ["Swing", "Day", "Scalp", "HODL", "Macro", "On-chain"];

export default function Profile() {
  const [prof, setProf] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    community.getProfile().then(setProf).catch(() => setProf({}));
  }, []);

  if (!prof) return <div style={{ padding: 40 }}><Spinner label="Loading profile…" /></div>;

  function up(k, v) { setProf((p) => ({ ...p, [k]: v })); setSaved(false); }

  async function save() {
    setSaving(true);
    try {
      await community.setProfile({
        display_name: prof.display_name,
        style: prof.style,
        bio: prof.bio,
        coins: prof.coins || [],
      });
      setSaved(true);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  return (
    <div className="fade-in" style={{ maxWidth: 520 }}>
      <div className="label" style={{ marginBottom: 6 }}>Your profile</div>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 20 }}>How others see you</h1>

      <div className="card">
        <div className="field">
          <label>Display name</label>
          <input value={prof.display_name || ""} maxLength={40}
            onChange={(e) => up("display_name", e.target.value)} placeholder="Your handle" />
        </div>

        <div className="field">
          <label>Trading style</label>
          <div className="row wrap" style={{ gap: 6 }}>
            {STYLES.map((s) => (
              <button key={s}
                className="btn"
                style={{
                  padding: "6px 12px", fontSize: 12,
                  borderColor: prof.style === s ? "var(--ember)" : "var(--border)",
                  color: prof.style === s ? "var(--ember)" : "var(--text-2)",
                }}
                onClick={() => up("style", prof.style === s ? "" : s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Bio</label>
          <textarea value={prof.bio || ""} maxLength={280} rows={3}
            onChange={(e) => up("bio", e.target.value)}
            placeholder="A line about how you read the market…"
            style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "var(--r-sm)", padding: 11, color: "var(--text-1)",
              fontFamily: "var(--body)", fontSize: 14, resize: "vertical",
            }} />
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
          <span className="faint" style={{ fontSize: 12 }}>
            {prof.post_count != null ? `${prof.post_count} posts` : ""}
          </span>
          <div className="row" style={{ gap: 10 }}>
            {saved && <span style={{ color: "var(--cool)", fontSize: 12 }}>Saved ✓</span>}
            <button className="btn btn-ember" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
