import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { data } from "../lib/api";
import { StatePill, Spinner } from "../components/ui";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function CoinDetail() {
  const { sym } = useParams();
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const r = await data.signals(sym, 120);
        if (alive) setD(r);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [sym]);

  if (loading) return <div style={{ padding: 40 }}><Spinner label={`Loading ${sym}…`} /></div>;
  if (err) return <p className="muted" style={{ padding: 40 }}>{err}</p>;
  if (!d?.available) {
    return (
      <div className="card" style={{ maxWidth: 460, margin: "40px auto" }}>
        <div className="card-title" style={{ marginBottom: 8 }}>{sym}</div>
        <p className="muted" style={{ fontSize: 14 }}>{d?.note || "History building for this asset."}</p>
      </div>
    );
  }

  const latest = d.latest || {};
  const rsi = latest.rsi || {};
  const macd = latest.macd || {};
  const ema = latest.ema_50_200 || {};
  const bb = latest.bollinger || {};

  const priceSeries = (d.history || [])
    .filter((s) => s.price != null)
    .map((s) => ({ date: s.date?.slice(5), price: s.price }));

  const rows = [
    { label: "RSI-14", value: rsi.value, state: rsi.state },
    { label: "MACD", value: null, state: macd.state },
    { label: "EMA 50/200", value: null, state: ema.state },
    { label: "Bollinger %B", value: bb.pct_b, state: bb.state },
    { label: "Funding rate", value: latest.funding_rate != null ? (latest.funding_rate * 100).toFixed(4) + "%" : null, state: null },
    { label: "60d cycle position", value: latest.cycle_60d_position != null ? Math.round(latest.cycle_60d_position * 100) + "%" : null, state: null },
  ];

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>{latest.date}</div>
          <h1 className="display" style={{ fontSize: 34 }}>{sym}</h1>
        </div>
        <Link to={`/patterns?coin=${sym}`}>
          <span className="btn btn-ember">Historical patterns →</span>
        </Link>
      </div>

      {priceSeries.length > 1 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title">Price · last {priceSeries.length} days</div>
            <span className="label">Binance</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceSeries} margin={{ top: 4, right: 6, left: -8, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: "#6b6b73", fontSize: 10, fontFamily: "Spline Sans Mono" }} interval="preserveStartEnd" minTickGap={44} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#6b6b73", fontSize: 10, fontFamily: "Spline Sans Mono" }} width={56} />
                <Tooltip contentStyle={{ background: "#141821", border: "1px solid #232834", borderRadius: 8, fontFamily: "Spline Sans Mono", fontSize: 12 }} labelStyle={{ color: "#a8a39a" }} />
                <Line type="monotone" dataKey="price" stroke="#e8703a" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head"><div className="card-title">Current signal states</div></div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {rows.map((r) => (
            <div key={r.label} style={{ padding: "10px 0", borderBottom: "1px solid var(--border-soft)" }}>
              <div className="label" style={{ marginBottom: 6 }}>{r.label}</div>
              <div className="row" style={{ gap: 10 }}>
                {r.value != null && <span className="mono" style={{ fontSize: 15 }}>{r.value}</span>}
                {r.state && <StatePill state={r.state} />}
                {r.value == null && !r.state && <span className="faint">—</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="disclaimer">
          Signal states describe where each indicator currently sits relative to its
          historical range. They are neutral observations, not buy or sell signals.
        </p>
      </div>
    </div>
  );
}
