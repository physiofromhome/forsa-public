import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { data } from "../lib/api";
import { StatePill, Spinner } from "../components/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts";

export default function Patterns() {
  const [params, setParams] = useSearchParams();
  const [coins, setCoins] = useState([]);
  const [coin, setCoin] = useState(params.get("coin") || "BTC");
  const [horizon, setHorizon] = useState(14);
  const [minMatch, setMinMatch] = useState(4);
  const [result, setResult] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    data.coins().then((c) => setCoins((c.coins || []).map((x) => x.symbol))).catch(() => {});
  }, []);

  async function run() {
    setLoading(true); setErr(""); setResult(null); setNarrative(null);
    setParams({ coin });
    try {
      const r = await data.patternMatch(coin, { minMatch, horizon });
      setResult(r);
      // Fetch the premium narrative in parallel once we know there are matches
      if (r.available && r.match_count > 0) {
        setNarrativeLoading(true);
        data.patternNarrative(coin, { minMatch, horizon })
          .then((nr) => setNarrative(nr))
          .catch(() => setNarrative(null))
          .finally(() => setNarrativeLoading(false));
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); /* run on first mount + coin change via button */ // eslint-disable-next-line
  }, []);

  const obs = result?.observed;
  const dist = (result?.instances || []).map((i) => ({
    date: i.date?.slice(2),
    change: i.forward_change_pct,
  }));

  return (
    <div className="fade-in">
      <div className="label" style={{ marginBottom: 6 }}>Historical pattern context</div>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 8 }}>
        When conditions looked like this before
      </h1>
      <p className="muted" style={{ maxWidth: 640, marginBottom: 22, fontSize: 15 }}>
        We find past days whose signal states matched {coin}&rsquo;s current states, then
        show — factually — what price did in the {horizon} days that followed. This is a
        record of what happened, not a forecast.
      </p>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="row wrap" style={{ gap: 16, alignItems: "flex-end" }}>
          <div className="field" style={{ marginBottom: 0, minWidth: 130 }}>
            <label>Asset</label>
            <select
              value={coin} onChange={(e) => setCoin(e.target.value)}
              style={selectStyle}
            >
              {coins.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 130 }}>
            <label>Horizon (days)</label>
            <select value={horizon} onChange={(e) => setHorizon(+e.target.value)} style={selectStyle}>
              {[7, 14, 30, 60].map((h) => <option key={h} value={h}>{h} days</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 150 }}>
            <label>Match strictness</label>
            <select value={minMatch} onChange={(e) => setMinMatch(+e.target.value)} style={selectStyle}>
              <option value={3}>Loose (3+ signals)</option>
              <option value={4}>Balanced (4+)</option>
              <option value={5}>Strict (5+)</option>
              <option value={6}>Exact (6)</option>
            </select>
          </div>
          <button className="btn btn-ember" style={{ padding: "10px 20px" }} onClick={run} disabled={loading}>
            {loading ? "Scanning…" : "Analyse"}
          </button>
        </div>
      </div>

      {loading && <Spinner label="Scanning history…" />}
      {err && <p className="muted">{err}</p>}

      {result && result.available && result.match_count > 0 && obs && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <div className="card-title">{result.match_count} comparable instances found</div>
              <span className="label">over {horizon} days forward</span>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
              <Outcome n={obs.rose} total={result.match_count} label="rose" tone="warm" />
              <Outcome n={obs.fell} total={result.match_count} label="fell" tone="cool" />
              <Outcome n={obs.flat} total={result.match_count} label="flat" tone="mid" />
              <div>
                <div className="label" style={{ marginBottom: 4 }}>Avg move</div>
                <div className="mono" style={{ fontSize: 20, color: obs.avg_forward_change_pct >= 0 ? "var(--warm)" : "var(--cool)" }}>
                  {obs.avg_forward_change_pct >= 0 ? "+" : ""}{obs.avg_forward_change_pct}%
                </div>
              </div>
            </div>

            <div className="row wrap" style={{ gap: 24, marginTop: 16 }}>
              <span className="faint mono" style={{ fontSize: 12 }}>
                Best: <span style={{ color: "var(--warm)" }}>+{obs.best_case_pct}%</span> ({obs.best_case_date})
              </span>
              <span className="faint mono" style={{ fontSize: 12 }}>
                Worst: <span style={{ color: "var(--cool)" }}>{obs.worst_case_pct}%</span> ({obs.worst_case_date})
              </span>
            </div>
          </div>

          {(narrativeLoading || narrative?.narrative) && (
            <div className="card" style={{
              marginBottom: 16,
              background: "linear-gradient(160deg, #161a23 0%, #14181f 100%)",
              borderColor: "rgba(232,112,58,0.28)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, var(--ember), transparent)",
              }} />
              <div className="card-head">
                <div className="row" style={{ gap: 9, alignItems: "center" }}>
                  <span className="display" style={{ fontSize: 16 }}>Analyst note</span>
                  {narrative?.narrative_source === "ai" && (
                    <span className="label" style={{ color: "var(--ember)", letterSpacing: "0.12em" }}>
                      Forsa Intelligence
                    </span>
                  )}
                </div>
                <span className="label">{coin} · {horizon}d</span>
              </div>

              {narrativeLoading ? (
                <div className="row" style={{ gap: 10, padding: "8px 0" }}>
                  <span className="spinner" />
                  <span className="muted" style={{ fontSize: 13 }}>Reading the historical record…</span>
                </div>
              ) : (
                <p style={{
                  fontSize: 15, lineHeight: 1.7, color: "var(--text-1)",
                  fontFamily: "var(--body)", fontWeight: 300, whiteSpace: "pre-wrap",
                }}>
                  {narrative.narrative}
                </p>
              )}
            </div>
          )}

          {dist.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-head"><div className="card-title">Distribution of outcomes</div></div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dist} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: "#6b6b73", fontSize: 9, fontFamily: "Spline Sans Mono" }} interval="preserveStartEnd" minTickGap={30} />
                    <YAxis tick={{ fill: "#6b6b73", fontSize: 10, fontFamily: "Spline Sans Mono" }} />
                    <Tooltip contentStyle={{ background: "#141821", border: "1px solid #232834", borderRadius: 8, fontFamily: "Spline Sans Mono", fontSize: 12 }} labelStyle={{ color: "#a8a39a" }} />
                    <ReferenceLine y={0} stroke="#3a3f4a" />
                    <Bar dataKey="change">
                      {dist.map((e, i) => (
                        <Cell key={i} fill={e.change >= 0 ? "#d6a85f" : "#6ea8c4"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-head"><div className="card-title">Matched signal states (today)</div></div>
            <div className="row wrap" style={{ gap: 8 }}>
              {Object.entries(result.current_states || {}).map(([k, v]) =>
                v ? <StatePill key={k} state={`${k}: ${v}`} /> : null
              )}
            </div>
          </div>

          <p className="disclaimer">{result.disclaimer}</p>
        </>
      )}

      {result && result.available && result.match_count === 0 && (
        <div className="card">
          <p className="muted" style={{ fontSize: 14 }}>
            {result.note || "No comparable historical instances at this match threshold. Try a looser setting."}
          </p>
        </div>
      )}

      {result && !result.available && (
        <div className="card">
          <p className="muted" style={{ fontSize: 14 }}>{result.note || "Not enough history yet for this asset."}</p>
        </div>
      )}
    </div>
  );
}

function Outcome({ n, total, label, tone }) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return (
    <div>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, color: `var(--${tone})` }}>{n}</div>
      <div className="faint mono" style={{ fontSize: 11 }}>{pct}% of cases</div>
    </div>
  );
}

const selectStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-sm)",
  padding: "10px 12px",
  color: "var(--text-1)",
  fontSize: 14,
  fontFamily: "var(--body)",
};
