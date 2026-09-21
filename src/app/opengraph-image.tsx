import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/seo";

/**
 * The card that appears when a page is shared.
 *
 * Generated rather than shipped as a file so it cannot drift from the brand
 * colours, and deliberately plain: no screenshot, no stock photography, and
 * nothing that would need redrawing when a calculator changes.
 */
export const alt = `${SITE_NAME} — Every Calculation. One Global Home.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          // Spec §18: navy ground, brand blue accent.
          background: "#0F172A",
          color: "#F8FAFC",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 22,
              background: "#2563EB",
              color: "#FFFFFF",
              fontSize: 60,
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: -1 }}>
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 44,
            fontWeight: 600,
            color: "#38BDF8",
            letterSpacing: -0.5,
          }}
        >
          Every Calculation. One Global Home.
        </div>

        <div style={{ marginTop: 26, fontSize: 28, color: "#94A3B8" }}>
          Calculators · Converters · Tools · Charts · Guides · Country Tools
        </div>

        <div
          style={{
            marginTop: 48,
            height: 8,
            width: 220,
            borderRadius: 4,
            background: "#14B8A6",
          }}
        />
      </div>
    ),
    size,
  );
}
