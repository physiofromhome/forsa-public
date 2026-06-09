import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { community } from "../lib/api";
import { Spinner } from "../components/ui";
import { PostComposer, PostCard } from "../components/Community";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [f, r, p] = await Promise.all([
          community.feed(40),
          community.rooms(),
          community.getProfile(),
        ]);
        if (!alive) return;
        setPosts(f.posts || []);
        setRooms((r.rooms || []).filter((x) => x.post_count > 0).slice(0, 12));
        setName(p.display_name || "");
      } catch { /* ignore */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="fade-in">
      <div className="label" style={{ marginBottom: 6 }}>Community</div>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 20 }}>The floor</h1>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 240px", gap: 20, alignItems: "start" }}>
        <div>
          <PostComposer coin="GENERAL" placeholder="Share something with the community…"
            onPosted={(p) => setPosts((cur) => [p, ...cur])} />

          {loading ? <Spinner label="Loading feed…" /> : (
            posts.length ? posts.map((p) => (
              <PostCard key={p.id} post={p} currentName={name}
                onDeleted={(id) => setPosts((cur) => cur.filter((x) => x.id !== id))} />
            )) : (
              <div className="card"><p className="muted" style={{ fontSize: 14 }}>
                No posts yet — be the first to start a conversation.
              </p></div>
            )
          )}
        </div>

        <aside className="card" style={{ position: "sticky", top: 76 }}>
          <div className="label" style={{ marginBottom: 12 }}>Active rooms</div>
          {rooms.length ? rooms.map((r) => (
            <Link key={r.coin} to={`/community/${r.coin}`}>
              <div className="row" style={{ justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-soft)" }}>
                <span className="mono" style={{ fontSize: 13 }}>{r.coin}</span>
                <span className="faint mono" style={{ fontSize: 11 }}>{r.post_count}</span>
              </div>
            </Link>
          )) : <p className="faint" style={{ fontSize: 12 }}>Rooms light up as people post.</p>}
          <Link to="/community/rooms"><div className="btn btn-ghost" style={{ width: "100%", marginTop: 12, fontSize: 12 }}>All rooms →</div></Link>
        </aside>
      </div>
    </div>
  );
}
