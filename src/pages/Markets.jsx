import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { data } from "../lib/api";
import { StatePill, Spinner } from "../components/ui";

export default function Markets() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const c = await data.coins();
        if (alive) setCoins(c.coins || []);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="fade-in">
      <div className="label" style={{ marginBottom: 6 }}>Markets</div>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 20 }}>Tracked assets</h1>

      {loading && <Spinner label="Loading coins…" />}
      {err && <p className="muted">{err}</p>}

      {!loading && !err && (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {coins.map((c) => (
            <Link to={`/markets/${c.symbol}`} key={c.symbol}>
              <div className="card" style={{ transition: "border-color .15s" }}
                   onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ember)")}
                   onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-soft)")}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="display" style={{ fontSize: 20 }}>{c.symbol}</span>
                  <span className="faint mono" style={{ fontSize: 10 }}>
                    {c.history_days ? `${c.history_days}d` : "—"}
                  </span>
                </div>
                <div className="faint" style={{ fontSize: 11, marginTop: 6 }}>
                  {c.earliest ? `History from ${c.earliest}` : "History building…"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
