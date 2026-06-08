// Maps a neutral band-state label to a calm colour class.
// Deliberately NOT red/green — these describe where a value sits historically,
// not a buy/sell call.
export function StatePill({ state }) {
  if (!state) return <span className="faint mono" style={{ fontSize: 11 }}>—</span>;
  const s = state.toLowerCase();
  let cls = "mid";
  if (s.includes("oversold") || s.includes("lower") || s.includes("fear") || s.includes("negative funding") || s.includes("btc-dominant"))
    cls = "cool";
  if (s.includes("overbought") || s.includes("upper") || s.includes("greed") || s.includes("elevated") || s.includes("alt-dominant") || s.includes("late-cycle") || s.includes("golden"))
    cls = "warm";
  return <span className={`state ${cls}`}>{state}</span>;
}

export function Spinner({ label }) {
  return (
    <div className="row" style={{ gap: 10, color: "var(--text-2)", fontSize: 13 }}>
      <span className="spinner" />
      {label && <span>{label}</span>}
    </div>
  );
}

export function Stat({ label, value, mono = true }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 3 }}>{label}</div>
      <div className={mono ? "mono" : ""} style={{ fontSize: 18, color: "var(--text-1)" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}
