import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="fade-in">
      <section style={{ padding: "48px 0 36px", maxWidth: 720 }}>
        <div className="label" style={{ marginBottom: 18 }}>Crypto market intelligence</div>
        <h1 className="display" style={{ fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.04, letterSpacing: "-0.02em" }}>
          Understand the market.
          <br />
          <span style={{ color: "var(--ember)" }}>Decide for yourself.</span>
        </h1>
        <p className="muted" style={{ fontSize: 18, marginTop: 22, maxWidth: 600, fontWeight: 300 }}>
          Forsa tracks the signals that move crypto — momentum, sentiment, funding,
          market regime — and shows you, factually, what happened the last time
          conditions looked like they do now. No tips. No calls. Just the data, read clearly.
        </p>
        <div className="row" style={{ marginTop: 30, gap: 12 }}>
          <Link to="/register"><span className="btn btn-ember" style={{ padding: "12px 22px", fontSize: 15 }}>Get access</span></Link>
          <Link to="/login"><span className="btn" style={{ padding: "12px 22px", fontSize: 15 }}>Sign in</span></Link>
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 28 }}>
        {[
          {
            t: "Live signal states",
            d: "RSI, MACD, EMA structure, Bollinger position, funding and market regime — presented as neutral states, not buy/sell verdicts.",
          },
          {
            t: "Verified history",
            d: "Years of real market data, computed from primary sources. Every figure is sourced — nothing is estimated or invented.",
          },
          {
            t: "Pattern context",
            d: "When today's conditions have occurred before, see exactly what price did afterwards — the full record, including the times it fell.",
          },
        ].map((f) => (
          <div className="card" key={f.t}>
            <div className="card-title" style={{ marginBottom: 8 }}>{f.t}</div>
            <p className="muted" style={{ fontSize: 14 }}>{f.d}</p>
          </div>
        ))}
      </section>

      <p className="disclaimer" style={{ maxWidth: 720 }}>
        Forsa provides market information and historical analysis for self-directed
        research. It does not provide investment advice or recommendations, and
        nothing here is an invitation or inducement to trade. Crypto assets are
        high risk. Past market behaviour is not a reliable indicator of future results.
      </p>
    </div>
  );
}
