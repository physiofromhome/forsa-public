import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { community } from "../lib/api";
import { Spinner } from "../components/ui";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    community.rooms()
      .then((r) => setRooms(r.rooms || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div className="label" style={{ marginBottom: 6 }}>Community</div>
      <h1 className="display" style={{ fontSize: 30, marginBottom: 20 }}>Coin rooms</h1>

      {loading ? <Spinner label="Loading rooms…" /> : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {rooms.map((r) => (
            <Link to={`/community/${r.coin}`} key={r.coin}>
              <div className="card"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ember)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-soft)")}>
                <div className="display" style={{ fontSize: 18 }}>{r.coin === "GENERAL" ? "General" : r.coin}</div>
                <div className="faint mono" style={{ fontSize: 11, marginTop: 4 }}>
                  {r.post_count} {r.post_count === 1 ? "post" : "posts"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
