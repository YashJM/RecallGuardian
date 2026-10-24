import { ImageResponse } from "next/og";
import {
  getRecallByNid,
  getRecallExtras,
  whoAtRisk,
  nidFromSlug,
} from "@/lib/recalls";

export const alt = "Canadian product recall — RecallGuardian";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Cache the generated card; recall content rarely changes once issued.
export const revalidate = 86400;

const SEV: Record<string, { color: string; label: string }> = {
  critical: { color: "#c01c2e", label: "Critical" },
  high: { color: "#b0730a", label: "High" },
  standard: { color: "#3e6b63", label: "Standard" },
};

// Pull the product photo as a data URL so a slow/blocked gov image never
// fails the whole card — we just fall back to the branded panel.
async function fetchImage(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 3_500_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function Shield({ s = 64 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path
        d="M12 2.5 20 5.2v6.1c0 4.7-3.2 8.3-8 10.2-4.8-1.9-8-5.5-8-10.2V5.2L12 2.5Z"
        fill="#c01c2e"
      />
      <path d="M10.6 14.3 7.8 11.5l1.3-1.3 1.5 1.5 4-4 1.3 1.3-5.3 5.3Z" fill="#fff" />
    </svg>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRecallByNid(nidFromSlug(slug));

  // Generic fallback card if the recall can't be loaded.
  if (!r) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
          }}
        >
          <Shield s={120} />
          <div style={{ fontSize: 52, fontWeight: 800, color: "#14273b", marginTop: 24 }}>
            RecallGuardian
          </div>
          <div style={{ fontSize: 28, color: "#58697a", marginTop: 8 }}>
            Canada&apos;s recalls, ranked
          </div>
        </div>
      ),
      size
    );
  }

  const sev = SEV[r.tier] ?? SEV.standard;
  const atRisk = whoAtRisk(r);
  const extras = await getRecallExtras(r);
  const photo = await fetchImage(extras.imageUrl);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff" }}>
        {/* severity accent rail */}
        <div style={{ width: 14, height: "100%", background: sev.color, display: "flex" }} />

        {/* left: product photo or branded panel */}
        <div
          style={{
            width: 468,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f6f8",
            overflow: "hidden",
          }}
        >
          {photo ? (
            <img src={photo} width={468} height={630} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <Shield s={200} />
          )}
        </div>

        {/* right: recall detail */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "56px 56px 44px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: sev.color,
                color: "#fff",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "9px 20px",
                borderRadius: 999,
              }}
            >
              {sev.label}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 700,
                color: "#58697a",
                marginLeft: 18,
                overflow: "hidden",
              }}
            >
              {r.category.slice(0, 40)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: r.title.length > 90 ? 44 : 54,
              fontWeight: 800,
              color: "#182838",
              lineHeight: 1.12,
              letterSpacing: -1,
              // clamp long titles
              overflow: "hidden",
              maxHeight: 300,
            }}
          >
            {r.title.slice(0, 150)}
          </div>

          {atRisk && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 24,
                fontSize: 26,
                color: "#182838",
              }}
            >
              <div style={{ display: "flex", color: "#b0730a", marginRight: 10, fontSize: 28 }}>
                ⚠
              </div>
              <div style={{ display: "flex", overflow: "hidden" }}>
                Most at risk: {atRisk.slice(0, 70)}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center" }}>
            <Shield s={44} />
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 800,
                color: "#14273b",
                marginLeft: 12,
              }}
            >
              RecallGuardian
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#58697a", marginLeft: 12 }}>
              · Canada&apos;s recalls, ranked
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
