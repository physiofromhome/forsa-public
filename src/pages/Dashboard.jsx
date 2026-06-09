import { useEffect, useState } from "react";
import { data } from "../lib/api";
import { StatePill, Spinner, Stat } from "../components/ui";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";

export default function Dashboard() {
  const [global, setGlobal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const g = await data.global(90);
        if (alive) setGlobal(g);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ padding: 40 }}><Spinner label="Loading market intelligence…" /></div>;
  if (err) return <ErrState msg={err} />;
  if (!global?.available) return <EmptyState note={global?.note} />;

  const latest = global.latest || {};
  const fg = latest.fear_greed || {};
  const regime = latest.regime || {};
  const onchain = latest.onchain || {};

  // Build F&G sparkline from history
  const series = (global.history || [])
    .filter((s) => s.fear_greed && s.fear_greed.value != null)
    .map((s) => ({ date: s.date?.slice(5), value: s.fear_greed.value }));

  return (
    <div className="fade-in">
      <div className="label" style={{ marginBottom: 6 }}>Market overview · {latest.date}</div>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 20 }}>The market, read clearly</h1>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 16 }}>
        <div className="card">
          <Stat label="Fear & Greed" value={fg.value != null ? `${fg.value} · ${fg.label || ""}` : "—"} mono={false} />
          <div style={{ marginTop: 10 }}><StatePill state={fg.state} /></div>
        </div>
        <div className="card">
          <Stat label="Market regime" value={regime.label || "—"} mono={false} />
          {regime.confidence != null && (
            <div className="faint mono" style={{ fontSize: 11, marginTop: 8 }}>
              {regime.confidence}% confidence
            </div>
          )}
        </div>
        <div className="card">
          <Stat label="BTC Pi-cycle ratio" value={onchain.pi_cycle_ratio != null ? `${onchain.pi_cycle_ratio}%` : "—"} />
          <div className="faint" style={{ fontSize: 11, marginTop: 8 }}>Long-cycle position indicator</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Fear &amp; Greed · last {series.length} days</div>
          <span className="label">alternative.me</span>
        </div>
        {series.length > 1 ? (
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8703a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e8703a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#6b6b73", fontSize: 10, fontFamily: "Spline Sans Mono" }} interval="preserveStartEnd" minTickGap={40} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6b6b73", fontSize: 10, fontFamily: "Spline Sans Mono" }} />
                <Tooltip
                  contentStyle={{ background: "#141821", border: "1px solid #232834", borderRadius: 8, fontFamily: "Spline Sans Mono", fontSize: 12 }}
                  labelStyle={{ color: "#a8a39a" }}
                />
                <Area type="monotone" dataKey="value" stroke="#e8703a" strokeWidth={1.6} fill="url(#fg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="muted" style={{ fontSize: 13 }}>History is still being built.</p>
        )}
      </div>

      <p className="disclaimer">
        These are factual market indicators and historical records for self-directed research.
        Nothing here is financial advice or a recommendation to trade.
      </p>
    </div>
  );
}

function ErrState({ msg }) {
  return <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
    <div className="card-title" style={{ marginBottom: 8 }}>Couldn’t load data</div>
    <p className="muted" style={{ fontSize: 14 }}>{msg}</p>
  </div>;
}
function EmptyState({ note }) {
  return <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
    <div className="card-title" style={{ marginBottom: 8 }}>Building history</div>
    <p className="muted" style={{ fontSize: 14 }}>{note || "Market history is being collected. Check back shortly."}</p>
  </div>;
}
