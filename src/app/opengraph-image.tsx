import { ImageResponse } from "next/og";

export const alt = "RecallGuardian — Canada's recalls, ranked";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
        }}
      >
        <div style={{ height: 14, width: "100%", background: "#c01c2e", display: "flex" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            <svg width={76} height={76} viewBox="0 0 24 24">
              <path
                d="M12 2.5 20 5.2v6.1c0 4.7-3.2 8.3-8 10.2-4.8-1.9-8-5.5-8-10.2V5.2L12 2.5Z"
                fill="#c01c2e"
              />
              <path d="M10.6 14.3 7.8 11.5l1.3-1.3 1.5 1.5 4-4 1.3 1.3-5.3 5.3Z" fill="#fff" />
            </svg>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#14273b", marginLeft: 18 }}>
              RecallGuardian
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#182838", letterSpacing: -2, lineHeight: 1.05 }}>
            Canada&apos;s recalls, ranked
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#58697a", marginTop: 24, maxWidth: 900 }}>
            Every Canadian safety recall in one plain-language feed — food and medicine first.
          </div>
        </div>
        <div style={{ display: "flex", padding: "0 80px 56px", fontSize: 26, color: "#58697a" }}>
          CFIA · Health Canada · Transport Canada · updated daily
        </div>
      </div>
    ),
    size
  );
}
