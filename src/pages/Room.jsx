import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { community, data } from "../lib/api";
import { Spinner, StatePill } from "../components/ui";
import { PostComposer, PostCard } from "../components/Community";

// The differentiator vs Discord/Telegram: live neutral signal data pinned
// above the discussion, so people debate the same facts.
export default function Room() {
  const { coin } = useParams();
  const c = (coin || "").toUpperCase();
  const [posts, setPosts] = useState([]);
  const [signals, setSignals] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const calls = [community.room(c, 40), community.getProfile()];
      if (c !== "GENERAL") calls.push(data.signals(c, 1).catch(() => null));
      const [room, prof, sig] = await Promise.all(calls);
      if (!alive) return;
      setPosts(room.posts || []);
      setName(prof.display_name || "");
      if (sig?.available) setSignals(sig.latest);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [c]);

  const rsi = signals?.rsi || {};
  const macd = signals?.macd || {};
  const ema = signals?.ema_50_200 || {};

  return (
    <div className="fade-in">
      <div className="row" style={{ gap: 8, marginBottom: 6 }}>
        <Link to="/community/rooms" className="faint" style={{ fontSize: 12 }}>← Rooms</Link>
      </div>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 16 }}>
        {c === "GENERAL" ? "General" : `${c} room`}
      </h1>

      {c !== "GENERAL" && signals && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title" style={{ fontSize: 14 }}>Current signal context</div>
            <Link to={`/markets/${c}`} className="label" style={{ color: "var(--ember)" }}>Full data →</Link>
          </div>
          <div className="row wrap" style={{ gap: 10 }}>
            {rsi.state && <StatePill state={`RSI ${rsi.value ?? ""}: ${rsi.state}`} />}
            {macd.state && <StatePill state={`MACD: ${macd.state}`} />}
            {ema.state && <StatePill state={`EMA: ${ema.state}`} />}
            {signals.funding_rate != null && (
              <StatePill state={`Funding: ${(signals.funding_rate * 100).toFixed(3)}%`} />
            )}
          </div>
          <p className="faint" style={{ fontSize: 11, marginTop: 10 }}>
            Neutral indicator states · for context, not advice
          </p>
        </div>
      )}

      <PostComposer coin={c} onPosted={(p) => setPosts((cur) => [p, ...cur])} />

      {loading ? <Spinner label="Loading room…" /> : (
        posts.length ? posts.map((p) => (
          <PostCard key={p.id} post={p} currentName={name}
            onDeleted={(id) => setPosts((cur) => cur.filter((x) => x.id !== id))} />
        )) : (
          <div className="card"><p className="muted" style={{ fontSize: 14 }}>
            Quiet in here. Start the conversation about {c}.
          </p></div>
        )
      )}
    </div>
  );
}
