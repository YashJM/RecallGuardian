// Shown instantly while a recall page is server-rendered on demand (ISR),
// so a tap never looks like a frozen screen. Mirrors the real detail layout.
export default function Loading() {
  return (
    <main className="wrap" aria-busy="true" aria-live="polite">
      <div style={{ paddingTop: "clamp(20px,4vw,34px)" }}>
        <span className="sk-back sk" aria-hidden="true" />
        <article className="detail skeleton">
          <div className="bar" />
          <div className="body">
            <div className="lead">
              <div style={{ minWidth: 0, flex: 1 }}>
                <span className="sk sk-line" style={{ width: "40%", height: 14 }} />
                <span className="sk sk-line" style={{ width: "92%", height: 26, marginTop: 14 }} />
                <span className="sk sk-line" style={{ width: "70%", height: 26 }} />
                <span className="sk sk-line" style={{ width: 150, height: 28, marginTop: 16, borderRadius: 7 }} />
              </div>
              <span className="sk sk-photo" aria-hidden="true" />
            </div>

            <span className="sk sk-risk" aria-hidden="true" />

            <div className="sk-section">
              <span className="sk sk-line" style={{ width: 160, height: 12 }} />
              <span className="sk sk-line" style={{ width: "96%", height: 16, marginTop: 14 }} />
              <span className="sk sk-line" style={{ width: "88%", height: 16 }} />
              <span className="sk sk-line" style={{ width: "72%", height: 16 }} />
            </div>

            <div className="sk-section">
              <span className="sk sk-line" style={{ width: 120, height: 12 }} />
              <span className="sk sk-line" style={{ width: "90%", height: 16, marginTop: 14 }} />
              <span className="sk sk-line" style={{ width: "80%", height: 16 }} />
            </div>
          </div>
        </article>
        <p className="sk-note">Loading the full recall notice…</p>
      </div>
    </main>
  );
}
