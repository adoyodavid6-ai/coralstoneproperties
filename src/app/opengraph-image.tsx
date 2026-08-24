import { ImageResponse } from "next/og";

// Branded social-share card shown when a CoralStone link is posted to
// WhatsApp, X, Facebook, Slack, etc. Generated at build time.
export const alt =
  "CoralStone Properties Listings — East Africa's trust-first property portal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (mirrors src/app/globals.css)
const NAVY = "#16425b";
const NAVY_DARK = "#0f2f43";
const CORAL = "#ff8559";
const LIGHT = "#f3f4f2";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: CORAL,
              display: "flex",
            }}
          />
          <div style={{ color: LIGHT, fontSize: 34, fontWeight: 700 }}>
            CoralStone
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              color: CORAL,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            East Africa's verified property platform
          </div>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            Find. Verify. Own.
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.7)",
              fontSize: 30,
              maxWidth: 760,
            }}
          >
            Trusted agents, confirmed listings, clear titles — across Kenya,
            Uganda, Tanzania and Rwanda.
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: "flex",
            color: "rgba(255,255,255,0.45)",
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Kenya · Uganda · Tanzania · Rwanda
        </div>
      </div>
    ),
    { ...size },
  );
}
