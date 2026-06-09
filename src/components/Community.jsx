import { useState } from "react";
import { community } from "../lib/api";

export function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso + (iso.endsWith("Z") ? "" : "Z")).getTime();
  const s = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(then).toLocaleDateString();
}

export function PostComposer({ coin, onPosted, placeholder }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    const text = body.trim();
    if (!text) return;
    setBusy(true); setErr("");
    try {
      const r = await community.post(coin, text);
      setBody("");
      onPosted?.(r.post);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder || `Share your read on ${coin}…`}
        rows={3}
        style={{
          width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)", padding: 12, color: "var(--text-1)",
          fontFamily: "var(--body)", fontSize: 14, resize: "vertical",
        }}
      />
      <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
        <span className="faint" style={{ fontSize: 11 }}>
          {err ? <span style={{ color: "var(--ember)" }}>{err}</span> : "Discussion only — not financial advice."}
        </span>
        <button className="btn btn-ember" onClick={submit} disabled={busy || !body.trim()}>
          {busy ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

export function PostCard({ post, currentName, onDeleted }) {
  const [likes, setLikes] = useState(post.like_count || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [cBody, setCBody] = useState("");
  const [cCount, setCCount] = useState(post.comment_count || 0);

  async function toggleLike() {
    try {
      const r = await community.like(post.id);
      setLiked(r.liked);
      setLikes(r.like_count);
    } catch { /* ignore */ }
  }

  async function loadComments() {
    if (!showComments && comments === null) {
      try {
        const r = await community.comments(post.id);
        setComments(r.comments || []);
      } catch { setComments([]); }
    }
    setShowComments((v) => !v);
  }

  async function addComment() {
    const text = cBody.trim();
    if (!text) return;
    try {
      const r = await community.addComment(post.id, text);
      setComments((c) => [...(c || []), r.comment]);
      setCBody("");
      setCCount((n) => n + 1);
    } catch { /* ignore */ }
  }

  const mine = currentName && post.author === currentName;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="mono" style={{ fontSize: 13, color: "var(--text-1)" }}>{post.author}</span>
          <span className="faint" style={{ fontSize: 11 }}>· {timeAgo(post.ts)}</span>
          {post.coin && post.coin !== "GENERAL" && (
            <span className="label" style={{ color: "var(--ember)" }}>{post.coin}</span>
          )}
        </div>
        {mine && (
          <button className="btn btn-ghost faint" style={{ padding: "2px 8px", fontSize: 11 }}
            onClick={async () => { try { await community.deletePost(post.id); onDeleted?.(post.id); } catch {} }}>
            Delete
          </button>
        )}
      </div>

      <p style={{ fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{post.body}</p>

      <div className="row" style={{ gap: 16, marginTop: 12 }}>
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={toggleLike}>
          <span style={{ color: liked ? "var(--ember)" : "var(--text-2)" }}>♥ {likes}</span>
        </button>
        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={loadComments}>
          💬 {cCount}
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 12, borderTop: "1px solid var(--border-soft)", paddingTop: 12 }}>
          {(comments || []).map((c) => (
            <div key={c.id} style={{ marginBottom: 10 }}>
              <div className="row" style={{ gap: 6 }}>
                <span className="mono" style={{ fontSize: 12 }}>{c.author}</span>
                <span className="faint" style={{ fontSize: 10 }}>· {timeAgo(c.ts)}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{c.body}</p>
            </div>
          ))}
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <input
              value={cBody}
              onChange={(e) => setCBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Reply…"
              style={{
                flex: 1, background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)", padding: "8px 10px", color: "var(--text-1)", fontSize: 13,
              }}
            />
            <button className="btn" onClick={addComment} disabled={!cBody.trim()}>Reply</button>
          </div>
        </div>
      )}
    </div>
  );
}
